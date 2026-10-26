import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules, QueryContext } from '@medusajs/framework/utils'
import { isAgentDeliveryCode } from '../agent-delivery'
import { isPickupOptionCode } from '../checkout-rules'
import { availability } from '../magazzino'
import { LINE_UNIT, formatOf } from '../../modules/magazzino/lib/formats'

/** Canale di vendita del seed: prenotazioni e ordini del sito condividono catalogo e giacenze. */
export const SALES_CHANNEL = 'Sito web'

export type BookableVariant = {
  variantId: string
  sku: string
  product: string
  variant: string
  /** Prezzo IVA inclusa in euro; null se il listino della regione non lo prevede. */
  price: number | null
  /** Ordinabili dal magazzino (lib/magazzino.ts): pezzi, o litri e chili per lo sfuso. null se il formato non è a magazzino. */
  stock: number | null
  /** Massimo per ordine: uguale a stock. */
  available: number | null
  /** Unità della quantità: pezzi, oppure litri o chili per le righe "da imbottigliare". */
  unit: 'pz' | 'L' | 'kg'
  /** Riga "da imbottigliare": litri o chili presi dallo sfuso, formato deciso dopo. */
  bulk: boolean
}

export type DeliveryOption = { id: string; name: string; pickup: boolean; agent: boolean }

async function salesContext(container: MedusaContainer) {
  const [region] = await container.resolve(Modules.REGION).listRegions({}, { take: 1 })
  const [channel] = await container.resolve(Modules.SALES_CHANNEL).listSalesChannels({ name: SALES_CHANNEL })
  return { region, channel }
}

/** Formati prenotabili con prezzo e disponibilità, come li vede il sito. */
export async function bookableVariants(container: MedusaContainer): Promise<BookableVariant[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { region } = await salesContext(container)
  const { data } = await query.graph({
    entity: 'product_variant',
    fields: ['id', 'sku', 'title', 'manage_inventory', 'product.title', 'product.status', 'calculated_price.calculated_amount'],
    context: { calculated_price: QueryContext({ region_id: region.id, currency_code: region.currency_code }) },
  })
  const variants = (data as unknown as {
    id: string
    sku: string | null
    title: string
    manage_inventory: boolean
    product: { title: string; status: string } | null
    calculated_price: { calculated_amount: number | null } | null
  }[]).filter((variant) => variant.product?.status === 'published')

  const available = await availability(container)
  return variants
    .map((variant): BookableVariant => {
      const format = formatOf(variant.sku)
      const stock = format ? (available[format.sku] ?? 0) : null
      return {
        variantId: variant.id,
        sku: variant.sku ?? '',
        product: variant.product?.title ?? '',
        variant: variant.title,
        price: variant.calculated_price?.calculated_amount ?? null,
        stock,
        available: stock,
        unit: format?.bulk ? LINE_UNIT[format.line] : 'pz',
        bulk: format?.bulk ?? false,
      }
    })
    .sort((a, b) => a.product.localeCompare(b.product) || Number(a.bulk) - Number(b.bulk) || a.variant.localeCompare(b.variant))
}

/**
 * Consegne utilizzabili nel gestionale: quelle attive sul sito (ritiro in sede, spedizione se
 * accesa) e la consegna a cura dell'agente. Prima i ritiri: il primo è la consegna predefinita.
 */
export async function deliveryOptions(container: MedusaContainer): Promise<DeliveryOption[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: 'shipping_option', fields: ['id', 'name', 'type.code', 'rules.attribute', 'rules.value'] })
  return (data as unknown as { id: string; name: string; type: { code: string } | null; rules: { attribute: string; value: string }[] }[])
    .filter((option) => !option.rules.some((rule) => rule.attribute === 'is_return' && rule.value === 'true'))
    .filter((option) => !option.rules.some((rule) => rule.attribute === 'enabled_in_store' && rule.value === 'false'))
    .map((option) => ({
      id: option.id,
      name: option.name,
      pickup: isPickupOptionCode(option.type?.code),
      agent: isAgentDeliveryCode(option.type?.code),
    }))
    .sort((a, b) => Number(b.pickup) - Number(a.pickup) || Number(b.agent) - Number(a.agent) || a.name.localeCompare(b.name))
}
