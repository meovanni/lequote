import type { ExecArgs, MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules, ProductStatus } from '@medusajs/framework/utils'
import {
  createApiKeysWorkflow,
  createProductsWorkflow,
  createProductTypesWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createTaxRatesWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from '@medusajs/medusa/core-flows'
import { ensureAgentDelivery } from '../lib/agent-delivery'
import { FILIERA_MODULE } from '../modules/filiera'
import { MANUAL_PAYMENT_PROVIDER_IDS } from '../modules/manual-payments'
import type FilieraModuleService from '../modules/filiera/service'

// Dati iniziali di Le Quote. Contiene solo fatti già noti: catalogo e prezzi della vetrina
// attuale, i due comuni, le aliquote IVA di legge. Tutto ciò che i titolari non hanno ancora
// fornito (indirizzi, tariffa e soglia di spedizione, giacenze) nasce vuoto o disattivato e si
// completa dal back office. Vedi docs/plan.md, "Dati mancanti dai titolari".

const COUNTRY = 'it'
const SALES_CHANNEL = 'Sito web'

// Aliquote IVA: olio d'oliva 4% (DPR 633/72, tab. A, parte II), miele naturale 10% (tab. A,
// parte III). Da confermare con il consulente insieme ai testi legali.
const VAT = { standard: 22, olio: 4, miele: 10 }

type Ctx = { container: MedusaContainer; log: (message: string) => void }

// Il canale di vendita è il primo dato creato: se esiste, lo script è già passato di qui. Se un
// passo successivo fallisce, si ricrea il database (npm run db:stop, eliminare .pgdata) e si rilancia.
async function alreadySeeded({ container }: Ctx): Promise<boolean> {
  const channels = await container.resolve(Modules.SALES_CHANNEL).listSalesChannels({ name: SALES_CHANNEL })
  return channels.length > 0
}

async function seedStore({ container, log }: Ctx) {
  const storeModule = container.resolve(Modules.STORE)
  const [store] = await storeModule.listStores()

  const { result: channels } = await createSalesChannelsWorkflow(container).run({
    input: { salesChannelsData: [{ name: SALES_CHANNEL, description: 'Vetrina lequote' }] },
  })
  const channel = channels[0]

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: 'Le Quote',
        // Anche la valuta IVA inclusa: senza regione nel contesto Medusa usa la preferenza della valuta.
        supported_currencies: [{ currency_code: 'eur', is_default: true, is_tax_inclusive: true }],
        default_sales_channel_id: channel.id,
      },
    },
  })
  log('Negozio e canale di vendita configurati.')
  return { store, channel }
}

async function seedRegionAndTaxes({ container, log }: Ctx) {
  const stripeEnabled = Boolean(process.env.STRIPE_API_KEY)
  const { result: regions } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: 'Italia',
          currency_code: 'eur',
          countries: [COUNTRY],
          is_tax_inclusive: true,
          payment_providers: [...MANUAL_PAYMENT_PROVIDER_IDS, ...(stripeEnabled ? ['pp_stripe_stripe'] : [])],
        },
      ],
    },
  })

  const { result: types } = await createProductTypesWorkflow(container).run({
    input: { product_types: [{ value: 'olio' }, { value: 'miele' }] },
  })
  const typeId = (value: string) => types.find((type) => type.value === value)!.id

  const { result: taxRegions } = await createTaxRegionsWorkflow(container).run({
    input: [
      {
        country_code: COUNTRY,
        provider_id: 'tp_system',
        default_tax_rate: { name: 'IVA ordinaria', code: 'IVA22', rate: VAT.standard },
      },
    ],
  })

  await createTaxRatesWorkflow(container).run({
    input: (['olio', 'miele'] as const).map((line) => ({
      tax_region_id: taxRegions[0].id,
      name: `IVA ${line}`,
      code: `IVA${VAT[line]}-${line.toUpperCase()}`,
      rate: VAT[line],
      rules: [{ reference: 'product_type', reference_id: typeId(line) }],
    })),
  })
  log('Regione Italia, IVA inclusa nei prezzi, aliquote 4% olio e 10% miele.')
  return { region: regions[0], typeId }
}

async function seedLocations(ctx: Ctx, channelId: string) {
  const { container, log } = ctx
  const { result: locations } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        { name: 'Roseto degli Abruzzi', address: { city: 'Roseto degli Abruzzi', province: 'TE', country_code: 'IT', address_1: '' } },
        { name: 'Cerchio', address: { city: 'Cerchio', province: 'AQ', country_code: 'IT', address_1: '' } },
      ],
    },
  })

  for (const location of locations) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({ input: { id: location.id, add: [channelId] } })
  }
  log('Sedi di Roseto e Cerchio create (indirizzi da completare).')
  return locations
}

async function seedFulfillment(ctx: Ctx, locations: { id: string; name: string }[]) {
  const { container, log } = ctx
  const fulfillment = container.resolve(Modules.FULFILLMENT)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const [profile] = await fulfillment.listShippingProfiles({ type: 'default' })
  const options: ReturnType<typeof shippingOption>[] = []

  for (const [index, location] of locations.entries()) {
    const ships = index === 0
    const set = await fulfillment.createFulfillmentSets({
      name: `${location.name}: ${ships ? 'spedizione e ritiro' : 'ritiro'}`,
      type: ships ? 'shipping' : 'pickup',
      service_zones: [{ name: `Italia (${location.name})`, geo_zones: [{ country_code: COUNTRY, type: 'country' }] }],
    })
    await link.create({ [Modules.STOCK_LOCATION]: { stock_location_id: location.id }, [Modules.FULFILLMENT]: { fulfillment_provider_id: 'manual_manual' } })
    await link.create({ [Modules.STOCK_LOCATION]: { stock_location_id: location.id }, [Modules.FULFILLMENT]: { fulfillment_set_id: set.id } })

    const zoneId = set.service_zones[0].id
    if (ships) {
      // Tariffa e soglia di spedizione gratuita non ancora fornite: l'opzione nasce spenta.
      options.push(shippingOption('Spedizione in Italia', 'spedizione', zoneId, profile.id, false))
    }
    options.push(shippingOption(`Ritiro a ${location.name}`, `ritiro-${index}`, zoneId, profile.id, true))
  }

  await createShippingOptionsWorkflow(container).run({ input: options })
  log('Ritiro gratuito nelle due sedi; spedizione creata disattivata, da tariffare.')
  return profile
}

function shippingOption(name: string, code: string, zoneId: string, profileId: string, enabled: boolean) {
  return {
    name,
    price_type: 'flat' as const,
    provider_id: 'manual_manual',
    service_zone_id: zoneId,
    shipping_profile_id: profileId,
    type: { label: name, description: enabled ? 'Gratuito' : 'Da configurare', code },
    prices: [{ currency_code: 'eur', amount: 0 }],
    rules: [
      { attribute: 'enabled_in_store', value: String(enabled), operator: 'eq' as const },
      { attribute: 'is_return', value: 'false', operator: 'eq' as const },
    ],
  }
}

// Catalogo e prezzi (IVA inclusa) della vetrina attuale, client/src/data/content.ts.
const CATALOG = [
  {
    handle: 'olio-extravergine',
    title: 'Olio Extravergine',
    line: 'olio',
    description: 'Solo olive dei nostri oliveti di Roseto degli Abruzzi.',
    variants: [
      { title: 'Bottiglia 750 ml', sku: 'OLIO-750ML', price: 15 },
      { title: 'Latta 5 l', sku: 'OLIO-5L', price: 75 },
    ],
  },
  {
    handle: 'miele',
    title: 'Miele',
    line: 'miele',
    description: 'Dagli apiari di Cerchio, in quota.',
    variants: [
      { title: 'Vasetto 250 g', sku: 'MIELE-250G', price: 5 },
      { title: 'Vasetto 500 g', sku: 'MIELE-500G', price: 8 },
    ],
  },
] as const

async function seedProducts(ctx: Ctx, refs: { channelId: string; profileId: string; typeId: (value: string) => string }) {
  await createProductsWorkflow(ctx.container).run({
    input: {
      products: CATALOG.map((product) => ({
        title: product.title,
        handle: product.handle,
        description: product.description,
        status: ProductStatus.PUBLISHED,
        type_id: refs.typeId(product.line),
        shipping_profile_id: refs.profileId,
        options: [{ title: 'Formato', values: product.variants.map((variant) => variant.title) }],
        variants: product.variants.map((variant) => ({
          title: variant.title,
          sku: variant.sku,
          manage_inventory: true,
          options: { Formato: variant.title },
          prices: [{ currency_code: 'eur', amount: variant.price }],
        })),
        sales_channels: [{ id: refs.channelId }],
      })),
    },
  })
  ctx.log('Catalogo creato: olio 750 ml e 5 l, miele 250 g e 500 g (giacenze a zero).')
}

async function seedApiKey({ container, log }: Ctx, channelId: string) {
  const { result } = await createApiKeysWorkflow(container).run({
    input: { api_keys: [{ title: 'Vetrina', type: 'publishable', created_by: '' }] },
  })
  await linkSalesChannelsToApiKeyWorkflow(container).run({ input: { id: result[0].id, add: [channelId] } })
  log(`Chiave pubblica della vetrina: ${result[0].token}`)
}

async function seedFiliera({ container, log }: Ctx) {
  const filiera: FilieraModuleService = container.resolve(FILIERA_MODULE)
  const text = (key: string, label: string) => ({ key, label, type: 'text' as const, visibility: 'public' as const, required: false })

  await filiera.createGroves([{ name: 'Oliveti del Borsacchio', municipality: 'Roseto degli Abruzzi', province: 'TE', cultivars: ['Moraiolo', 'Leccino', 'Pendolino'] }])
  await filiera.createApiaries([{ name: 'Apiari di Cerchio', municipality: 'Cerchio', province: 'AQ' }])
  await filiera.createStageTemplates([
    { product_line: 'olio', position: 1, name: 'Raccolta', fields: [text('varieta', 'Varietà'), text('metodo', 'Metodo di raccolta')] },
    { product_line: 'olio', position: 2, name: 'Molitura', fields: [text('metodo', 'Metodo di estrazione')] },
    { product_line: 'olio', position: 3, name: 'Imbottigliamento', fields: [] },
    { product_line: 'miele', position: 1, name: 'Smielatura', fields: [text('fioritura', 'Fioritura prevalente'), text('metodo', 'Metodo')] },
    { product_line: 'miele', position: 2, name: 'Invasettamento', fields: [] },
  ])
  log('Filiera: oliveti, apiari e modelli di fase iniziali.')
}

export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const ctx: Ctx = { container, log: (message) => logger.info(message) }

  if (await alreadySeeded(ctx)) {
    ctx.log('Dati iniziali già presenti: nessuna modifica.')
    return
  }

  const { channel } = await seedStore(ctx)
  const { typeId } = await seedRegionAndTaxes(ctx)
  const locations = await seedLocations(ctx, channel.id)
  const profile = await seedFulfillment(ctx, locations)
  await ensureAgentDelivery(container)
  await seedProducts(ctx, { channelId: channel.id, profileId: profile.id, typeId })
  await seedApiKey(ctx, channel.id)
  await seedFiliera(ctx)
}
