import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, getVariantAvailability, Modules, QueryContext } from '@medusajs/framework/utils'
import { isPickupOptionCode } from '../checkout-rules'

/** Canale di vendita del seed: prenotazioni e ordini del sito condividono catalogo e giacenze. */
export const SALES_CHANNEL = 'Sito web'

export type BookableVariant = {
  variantId: string
  sku: string
  product: string
  variant: string
  /** Prezzo IVA inclusa in euro; null se il listino della regione non lo prevede. */
  price: number | null
  /** Pezzi disponibili nel canale del sito; null se la giacenza non è gestita. */
  stock: number | null
}

export type DeliveryOption = { id: string; name: string; pickup: boolean }

async function salesContext(container: MedusaContainer) {
  const [region] = await container.resolve(Modules.REGION).listRegions({}, { take: 1 })
  const [channel] = await container.resolve(Modules.SALES_CHANNEL).listSalesChannels({ name: SALES_CHANNEL })
  return { region, channel }
}

/** Formati prenotabili con prezzo e disponibilità, come li vede il sito. */
export async function bookableVariants(container: MedusaContainer): Promise<BookableVariant[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { region, channel } = await salesContext(container)
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

  const availability = await getVariantAvailability(query, { variant_ids: variants.map((variant) => variant.id), sales_channel_id: channel.id })
  return variants
    .map((variant) => ({
      variantId: variant.id,
      sku: variant.sku ?? '',
      product: variant.product?.title ?? '',
      variant: variant.title,
      price: variant.calculated_price?.calculated_amount ?? null,
      stock: variant.manage_inventory ? (availability[variant.id]?.availability ?? 0) : null,
    }))
    .sort((a, b) => a.product.localeCompare(b.product) || a.variant.localeCompare(b.variant))
}

/** Consegne utilizzabili: quelle attive anche sul sito (ritiro in sede, spedizione se accesa). */
export async function deliveryOptions(container: MedusaContainer): Promise<DeliveryOption[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: 'shipping_option', fields: ['id', 'name', 'type.code', 'rules.attribute', 'rules.value'] })
  return (data as unknown as { id: string; name: string; type: { code: string } | null; rules: { attribute: string; value: string }[] }[])
    .filter((option) => !option.rules.some((rule) => rule.attribute === 'is_return' && rule.value === 'true'))
    .filter((option) => !option.rules.some((rule) => rule.attribute === 'enabled_in_store' && rule.value === 'false'))
    .map((option) => ({ id: option.id, name: option.name, pickup: isPickupOptionCode(option.type?.code) }))
    .sort((a, b) => Number(b.pickup) - Number(a.pickup) || a.name.localeCompare(b.name))
}
