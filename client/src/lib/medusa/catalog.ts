import { storeFetch } from './client'

// Forma ridotta dei prodotti come li usa la vetrina: i testi stanno nei file di contenuto
// tradotti, da Medusa arrivano solo varianti, prezzi IVA inclusa e disponibilità.

export interface CatalogVariant {
  id: string
  sku: string
  /** Titolo del back office, in italiano: la vetrina lo traduce per SKU quando può. */
  title: string
  /** Prezzo IVA inclusa in euro; null se il listino della regione non lo prevede. */
  price: number | null
  /** Pezzi ordinabili; null quando la giacenza non è gestita (sempre ordinabile). */
  stock: number | null
  purchasable: boolean
}

export interface CatalogProduct {
  id: string
  handle: string
  variants: CatalogVariant[]
}

interface RawVariant {
  id: string
  sku: string | null
  title: string | null
  manage_inventory?: boolean | null
  allow_backorder?: boolean | null
  inventory_quantity?: number | null
  calculated_price?: { calculated_amount?: number | null } | null
}

interface RawProduct {
  id: string
  handle: string
  variants?: RawVariant[] | null
}

export function toCatalogVariant(raw: RawVariant): CatalogVariant {
  const price = raw.calculated_price?.calculated_amount ?? null
  const stock = raw.manage_inventory ? Math.max(0, raw.inventory_quantity ?? 0) : null
  const inStock = stock === null || stock > 0 || Boolean(raw.allow_backorder)
  return {
    id: raw.id,
    sku: raw.sku ?? '',
    title: raw.title ?? '',
    price,
    stock,
    purchasable: price !== null && inStock,
  }
}

export function toCatalogProduct(raw: RawProduct): CatalogProduct {
  return {
    id: raw.id,
    handle: raw.handle,
    variants: (raw.variants ?? []).map(toCatalogVariant),
  }
}

interface Region {
  id: string
  countries?: { iso_2: string }[]
}

let regionPromise: Promise<string> | null = null

/** La regione Italia (l'unica, ADR: si spedisce solo in Italia), cercata una volta per sessione. */
export function getRegionId(): Promise<string> {
  regionPromise ??= storeFetch<{ regions: Region[] }>('/store/regions')
    .then(({ regions }) => {
      const italy = regions.find((region) => region.countries?.some((country) => country.iso_2 === 'it')) ?? regions[0]
      if (!italy) throw new Error('Nessuna regione configurata in Medusa.')
      return italy.id
    })
    .catch((error: unknown) => {
      regionPromise = null
      throw error
    })
  return regionPromise
}

const PRODUCT_FIELDS = [
  'id',
  'handle',
  'variants.id',
  'variants.sku',
  'variants.title',
  'variants.manage_inventory',
  'variants.allow_backorder',
  '+variants.inventory_quantity',
  '*variants.calculated_price',
].join(',')

export async function getProduct(handle: string): Promise<CatalogProduct | null> {
  const regionId = await getRegionId()
  const query = new URLSearchParams({
    handle,
    region_id: regionId,
    fields: PRODUCT_FIELDS,
  })
  const { products } = await storeFetch<{ products: RawProduct[] }>(`/store/products?${query}`)
  return products[0] ? toCatalogProduct(products[0]) : null
}
