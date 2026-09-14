export type SurfaceTheme = 'dark' | 'light'

export interface NavItem {
  id: string
  label: string
}

export interface ProductTag {
  label: string
}

export interface ShopVariantOption {
  id: string
  label: string
  /** Prezzo in euro. */
  price: number
  /** Assente finché la foto del formato non è disponibile: ImagePlaceholder mostra un
   * riquadro segnaposto coerente col resto del sito finché non viene valorizzato. */
  image?: string
  imageLabel: string
}

export interface ShopProduct {
  id: string
  name: string
  note: string
  variants: ShopVariantOption[]
}

export interface ShopFulfillmentOption {
  id: 'spedizione' | 'ritiro'
  label: string
  note: string
}
