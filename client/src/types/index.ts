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
  /** Codice del formato nel back office: prezzo e disponibilità arrivano da Medusa. */
  sku: string
  label: string
  /** Assente finché la foto del formato non è disponibile: ImagePlaceholder mostra un
   * riquadro segnaposto coerente col resto del sito finché non viene valorizzato. */
  image?: string
  imageLabel: string
}

export interface ShopProduct {
  id: string
  /** Handle della scheda prodotto (/prodotti/:handle). */
  handle: string
  name: string
  note: string
  variants: ShopVariantOption[]
}

/* Tipi dei contenuti che in Fase 2 arriveranno dal back office (vedi docs/adr/0002): la forma
   è già quella delle future risposte API, così il passaggio cambierà solo la fonte dei dati. */

export type ProductLine = 'olio' | 'miele'

export interface FilieraStep {
  id: string
  title: string
  place: string
  period: string
  description: string
}

/** Voce del pannello "Informazioni di legge": cosa, valore, e la norma che lo richiede. */
export interface LegalInfoItem {
  label: string
  value: string
  reference?: string
}

export interface FilieraLine {
  line: ProductLine
  label: string
  elevation: string
  summary: string
  steps: FilieraStep[]
  legalInfo: LegalInfoItem[]
}

export interface SeasonActivity {
  id: string
  label: string
  /** Mesi 1-12, estremi inclusi; `from > to` indica un intervallo a cavallo d'anno. */
  from: number
  to: number
}

export interface SeasonTrack {
  line: ProductLine
  label: string
  place: string
  activities: SeasonActivity[]
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface FaqTopic {
  id: string
  label: string
  items: FaqItem[]
}
