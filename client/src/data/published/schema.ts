import { LOCALES, type Locale } from '@/i18n/locales'
import { it } from '@/data/content/it'
import { en } from '@/data/content/en'
import { de } from '@/data/content/de'
import { legalIt } from '@/data/legal/it'
import { legalEn } from '@/data/legal/en'
import { legalDe } from '@/data/legal/de'
import { LEGAL_PAGES } from '@/data/legal/types'
import * as businessDefaults from '@/data/business'
import { flattenStrings } from './overrides'

// Elenco dei contenuti modificabili dal back office (sezione Contenuti), con i testi di partenza
// nelle tre lingue. Lo genera "npm run content:export" in server/src/modules/contenuti: il server
// lo usa per mostrare i campi e per accettare solo chiavi che esistono. Un test controlla che il
// file sul server sia aggiornato quando cambiano i testi qui.

export type Scope = Locale | 'shared'
export type FieldKind = 'text' | 'long' | 'image' | 'link'

export interface ContentField {
  key: string
  label: string
  kind: FieldKind
  /** "shared": un solo valore per tutte le lingue (foto, dati aziendali). */
  scope: 'locale' | 'shared'
  /** Perché il testo non si può cambiare dal back office. */
  locked?: string
  defaults: Partial<Record<Scope, string>>
}

export interface ContentSection {
  id: string
  group: string
  label: string
  fields: ContentField[]
}

export interface ContentSchema {
  version: 1
  sections: ContentSection[]
}

const legalLabels = legalIt.ui.linkLabels

const SECTIONS: { id: string; group: string; label: string; prefixes: string[] }[] = [
  { id: 'hero', group: 'Home', label: 'Apertura', prefixes: ['hero'] },
  { id: 'territorio', group: 'Home', label: 'Territorio', prefixes: ['territorio'] },
  { id: 'olio', group: 'Home', label: 'Olio', prefixes: ['olio'] },
  { id: 'miele', group: 'Home', label: 'Miele', prefixes: ['miele'] },
  { id: 'filiera', group: 'Home', label: 'Filiera', prefixes: ['filiera'] },
  { id: 'stagioni', group: 'Home', label: 'Stagioni', prefixes: ['stagioni'] },
  { id: 'shop', group: 'Home', label: 'Shop', prefixes: ['shop', 'shopCatalog'] },
  { id: 'domande', group: 'Home', label: 'Domande frequenti', prefixes: ['domande'] },
  { id: 'contatti', group: 'Home', label: 'Contatti', prefixes: ['contatti'] },
  { id: 'footer', group: 'Home', label: 'Piè di pagina', prefixes: ['footer'] },
  { id: 'menu', group: 'Home', label: 'Menu', prefixes: ['navItems', 'footerNavItems'] },
  { id: 'meta', group: 'Home', label: 'Google e condivisioni', prefixes: ['meta'] },
  { id: 'prodotto-olio', group: 'Schede prodotto', label: 'Olio extravergine', prefixes: ['products.olio-extravergine'] },
  { id: 'prodotto-miele', group: 'Schede prodotto', label: 'Miele', prefixes: ['products.miele'] },
  { id: 'prodotti-diciture', group: 'Schede prodotto', label: 'Diciture comuni', prefixes: ['productUi'] },
  { id: 'carrello', group: 'Acquisto', label: 'Carrello', prefixes: ['cartUi'] },
  { id: 'checkout', group: 'Acquisto', label: 'Dati, consegna e pagamento', prefixes: ['checkoutUi'] },
  { id: 'ordine', group: 'Acquisto', label: 'Conferma d’ordine', prefixes: ['orderUi'] },
  { id: 'lotto', group: 'Lotti e analisi', label: 'Pagina del lotto', prefixes: ['lotUi'] },
  { id: 'analisi', group: 'Lotti e analisi', label: 'Pagina delle analisi', prefixes: ['analysisUi'] },
  ...LEGAL_PAGES.map((page) => ({ id: `legale-${page}`, group: 'Pagine legali', label: legalLabels[page], prefixes: [`legal.documents.${page}`] })),
  { id: 'legale-modulo', group: 'Pagine legali', label: 'Modulo di recesso', prefixes: ['legal.withdrawalForm'] },
  { id: 'legale-diciture', group: 'Pagine legali', label: 'Diciture comuni', prefixes: ['legal.ui'] },
  { id: 'azienda', group: 'Azienda', label: 'Dati aziendali', prefixes: ['business'] },
  { id: 'interfaccia', group: 'Azienda', label: 'Diciture del sito', prefixes: ['ui'] },
]

/** Identificatori e collegamenti interni: servono al codice, non si traducono. */
const STRUCTURAL = new Set(['id', 'line', 'illustration', 'handle', 'sku'])
const IMAGE_KEYS = new Set(['image', 'imageAlt', 'poster'])
/** La versione piccola della foto di apertura segue la grande (il server le salva insieme). */
const HIDDEN = new Set(['hero.posterSmall'])

const LOCKED: Record<string, string> = {
  'checkoutUi.submit': 'Dicitura imposta dall’art. 51, comma 2, del Codice del Consumo.',
  'legal.withdrawalForm.openButton': 'Dicitura imposta dall’art. 54-bis del Codice del Consumo.',
  'legal.withdrawalForm.confirmButton': 'Dicitura imposta dall’art. 54-bis del Codice del Consumo.',
  'business.BANK_TRANSFER_DAYS':
    'Si cambia sul server (BANK_TRANSFER_DAYS), insieme alla regola che annulla gli ordini non pagati.',
}

// Nomi dei campi in italiano. Per gli elenchi, il nome al singolare di una voce.
const WORDS: Record<string, string> = {
  eyebrow: 'Occhiello',
  title: 'Titolo',
  subtitle: 'Sottotitolo',
  body: 'Testo',
  intro: 'Introduzione',
  note: 'Nota',
  label: 'Etichetta',
  description: 'Descrizione',
  question: 'Domanda',
  answer: 'Risposta',
  heading: 'Titolo',
  place: 'Luogo',
  period: 'Periodo',
  summary: 'Riassunto',
  value: 'Valore',
  reference: 'Riferimento normativo',
  name: 'Nome',
  closing: 'Frase finale',
  credit: 'Crediti',
  elevation: 'Quota',
  image: 'Foto',
  imageAlt: 'Seconda foto',
  imageLabel: 'Descrizione della foto',
  imageLabelAlt: 'Descrizione della seconda foto',
  poster: 'Foto',
  posterAlt: 'Descrizione della foto',
  metaTitle: 'Titolo per Google',
  metaDescription: 'Descrizione per Google',
  ctaPrimary: 'Pulsante principale',
  ctaSecondary: 'Pulsante secondario',
  href: 'Indirizzo',
  email: 'Email',
  phone: 'Telefono',
  tagline: 'Motto',
  legal: 'Note legali',
  acidity: 'Acidità di riserva',
  per: 'Riferimento dei valori',
  nutrition: 'Dichiarazione nutrizionale',
  variantLabels: 'Nome del formato',
  lookup: 'Ricerca del lotto',
  placeholder: 'Esempio nel campo',
  help: 'Aiuto',
  // Elenchi: nome di una voce
  paragraphs: 'Paragrafo',
  months: 'Mese',
  monthsLong: 'Mese per esteso',
  list: 'Voce',
  sources: 'Riferimento',
  items: 'Domanda',
  topics: 'Argomento',
  steps: 'Passo',
  legalInfo: 'Voce di legge',
  varieties: 'Varietà',
  places: 'Luogo',
  facts: 'Dato',
  rows: 'Riga',
  activities: 'Attività',
  tracks: 'Riga del calendario',
  sections: 'Sezione',
  social: 'Social',
  lines: 'Linea',
  variants: 'Formato',
  shopCatalog: 'Prodotto',
  navItems: 'Menu in alto',
  footerNavItems: 'Menu in fondo',
  // Dati aziendali
  SELLER: 'Venditore',
  BANK_TRANSFER: 'Bonifico',
  BANK_TRANSFER_DAYS: 'Giorni per pagare con bonifico',
  holder: 'Intestatario del conto',
  iban: 'IBAN',
  address: 'Indirizzo',
  vat: 'Partita IVA',
  pec: 'PEC',
  // Gruppi di diciture
  paymentOptions: 'Modi di pagamento',
  bonifico: 'Bonifico',
  ritiro: 'Al ritiro',
  errors: 'Messaggi di errore',
  groups: 'Gruppi di valori',
  valueLabels: 'Nomi dei valori',
  units: 'Unità di misura',
  languageNames: 'Nomi delle lingue',
  lineName: 'Nome della linea',
  linkLabels: 'Nomi nel piè di pagina',
}

/** Etichette per chiave intera, dove il nome del campo da solo sarebbe ambiguo. */
const LABELS: Record<string, string> = {
  'business.SELLER.name': 'Venditore › Ragione sociale',
  'business.SELLER.address': 'Venditore › Sede legale',
}

const NAME_FIELDS = ['title', 'label', 'question', 'heading', 'name']

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function word(segment: string): string {
  if (WORDS[segment]) return WORDS[segment]
  const spaced = segment.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

const quote = (text: string) => `«${text.length > 60 ? `${text.slice(0, 57).trimEnd()}…` : text}»`

/**
 * "Olio extravergine › Molitura › Descrizione": i nomi delle voci al posto dei numeri. Un testo
 * senza un nome in italiano (le diciture dei pulsanti) si riconosce dal suo testo di partenza.
 */
function labelFor(segments: string[], root: unknown): string {
  const parts: string[] = []
  let node: unknown = root
  segments.forEach((segment, index) => {
    const next = Array.isArray(node) ? node[Number(segment)] : isPlainObject(node) ? node[segment] : undefined
    if (Array.isArray(node)) {
      const named = isPlainObject(next) ? NAME_FIELDS.map((field) => next[field]).find((v) => typeof v === 'string' && v) : undefined
      const list = parts.pop() ?? 'Voce'
      parts.push(typeof named === 'string' ? named : `${list} ${Number(segment) + 1}`)
    } else if (index === segments.length - 1 && !WORDS[segment] && typeof next === 'string' && next) {
      parts.push(quote(next))
    } else {
      parts.push(word(segment))
    }
    node = next
  })
  return parts.join(' › ')
}

function nodeAt(root: unknown, path: string[]): unknown {
  return path.reduce<unknown>((node, segment) => (isPlainObject(node) || Array.isArray(node) ? (node as Record<string, unknown>)[segment] : undefined), root)
}

function kindOf(key: string, values: string[]): FieldKind {
  const last = key.split('.').at(-1) ?? ''
  if (IMAGE_KEYS.has(last) && values.every((value) => value === '' || value.startsWith('/'))) return 'image'
  if (last === 'href') return 'link'
  return values.some((value) => value.length > 80 || value.includes('\n')) ? 'long' : 'text'
}

function isEditable(key: string): boolean {
  const segments = key.split('.')
  const last = segments.at(-1) ?? ''
  if (STRUCTURAL.has(last) || HIDDEN.has(key)) return false
  // Gli indirizzi interni (#territorio) restano nel codice; quelli dei social si cambiano.
  if (last === 'href') return key.startsWith('footer.social.')
  return true
}

export function buildContentSchema(): ContentSchema {
  const sources: Record<Locale, unknown> = {
    it: { ...it, legal: legalIt },
    en: { ...en, legal: legalEn },
    de: { ...de, legal: legalDe },
  }
  const flat = Object.fromEntries(LOCALES.map((locale) => [locale, flattenStrings(sources[locale])])) as Record<Locale, Record<string, string>>
  const shared = flattenStrings({ business: { ...businessDefaults } })
  const allKeys = [...new Set([...LOCALES.flatMap((locale) => Object.keys(flat[locale])), ...Object.keys(shared)])]

  const fieldFor = (key: string): ContentField => {
    if (key in shared) {
      return { key, label: '', kind: kindOf(key, [shared[key]]), scope: 'shared', defaults: { shared: shared[key] } }
    }
    const defaults = Object.fromEntries(LOCALES.filter((locale) => key in flat[locale]).map((locale) => [locale, flat[locale][key]]))
    const kind = kindOf(key, Object.values(defaults))
    // Le foto sono le stesse in ogni lingua: un solo valore, quello italiano di partenza.
    if (kind === 'image') return { key, label: '', kind, scope: 'shared', defaults: { shared: defaults.it ?? '' } }
    return { key, label: '', kind, scope: 'locale', defaults }
  }

  const root = { ...it, legal: legalIt, business: { ...businessDefaults } }
  const sections = SECTIONS.map((section) => {
    const fields = allKeys
      .filter(isEditable)
      .flatMap((key) => {
        const prefix = section.prefixes.find((p) => key === p || key.startsWith(`${p}.`))
        if (!prefix) return []
        const field = fieldFor(key)
        const rest = key.slice(prefix.length + 1).split('.').filter(Boolean)
        const prefixLabel = section.prefixes.length > 1 ? [word(prefix)] : []
        const label = [...prefixLabel, labelFor(rest, nodeAt(root, prefix.split('.')))].filter(Boolean).join(' › ')
        return [{ ...field, label: LABELS[key] ?? (label || word(prefix)), ...(LOCKED[key] && { locked: LOCKED[key] }) }]
      })
    return { id: section.id, group: section.group, label: section.label, fields }
  })

  return { version: 1, sections }
}

/** Chiavi modificabili che non stanno in nessuna sezione: devono restare zero (test). */
export function unassignedKeys(schema: ContentSchema): string[] {
  const listed = new Set(schema.sections.flatMap((section) => section.fields.map((field) => field.key)))
  const sources = [flattenStrings({ ...it, legal: legalIt }), flattenStrings({ business: { ...businessDefaults } })]
  return sources.flatMap((flat) => Object.keys(flat)).filter((key) => isEditable(key) && !listed.has(key))
}

/** Testo del file per il server: lo stesso formato nello script e nel test di allineamento. */
export const serializeSchema = (schema: ContentSchema) => `${JSON.stringify(schema, null, 2)}\n`
