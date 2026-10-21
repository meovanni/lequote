// Testi legali come dati: ogni sezione porta le sue fonti, così il consulente li verifica punto
// per punto (PRODUCT.md, "Legal Commitments"). Sono bozze finché non li valida.

export type LegalBlock = string | { list: string[] }

export interface LegalSection {
  /** Uguale in ogni lingua: àncora della sezione e chiave dei test di coerenza. */
  id: string
  heading: string
  body: LegalBlock[]
  /** Riferimenti normativi, nella forma in cui sono pubblicati (in italiano o nella fonte UE). */
  sources?: string[]
}

export interface LegalDocument {
  title: string
  metaDescription: string
  intro?: string
  sections: LegalSection[]
}

export const LEGAL_PAGES = ['condizioni-di-vendita', 'recesso', 'privacy', 'cookie'] as const
export type LegalPage = (typeof LEGAL_PAGES)[number]

export interface LegalContent {
  ui: {
    draftNotice: string
    /** Solo nelle traduzioni: in caso di dubbio prevale il testo italiano. */
    translationNotice?: string
    updated: (date: string) => string
    sourcesLabel: string
    tocLabel: string
    footerNavLabel: string
    /** Nome breve di ogni pagina, per il footer. */
    linkLabels: Record<LegalPage, string>
  }
  /** Funzione di recesso online (Cod. Consumo art. 54-bis): diciture dei pulsanti prescritte. */
  withdrawalForm: {
    openButton: string
    confirmButton: string
    intro: string
    name: string
    email: string
    emailHelp: string
    order: string
    orderHelp: string
    details: string
    detailsHelp: string
    required: string
    invalidEmail: string
    sending: string
    doneTitle: string
    doneBody: (email: string, sentAt: string) => string
    error: string
    tooMany: string
  }
  documents: Record<LegalPage, LegalDocument>
}

/** Data dell'ultima revisione dei testi, uguale in tutte le lingue. */
export const LEGAL_UPDATED = '2026-10-21'
