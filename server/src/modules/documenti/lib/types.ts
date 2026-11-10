// Contenuto dei documenti di vendita (sales_document.data): quello che si stampa, fissato al
// momento dell'emissione. Importi in euro, IVA inclusa dove non detto altrimenti.

export type DocumentKind = 'ddt' | 'fattura'

/** Il venditore, dai dati aziendali pubblicati (Contenuti › Dati aziendali). */
export type Seller = { name: string; address: string; vat: string; email: string; pec: string; phone: string; iban: string; bankHolder: string }

export type CustomerKind = 'privato' | 'azienda'

export type Party = {
  kind: CustomerKind
  /** Ragione sociale per le aziende, nome e cognome per i privati. */
  name: string
  address: string
  postalCode: string
  city: string
  province: string
  vat: string
  fiscalCode: string
  /** Fattura elettronica: codice destinatario SDI o PEC (facoltativi: senza, va nel cassetto fiscale). */
  sdiCode: string
  pec: string
  email: string
  phone: string
}

/** Un ordine come lo leggono DDT e fatture (orders.ts). */
export type SourceOrder = {
  id: string
  code: string
  createdAt: string
  status: string
  delivered: boolean
  customer: Party
  items: SourceLine[]
  shipping: { name: string; total: number; taxTotal: number; rate: number }[]
  total: number
  paid: number
  /** Mezzo di pagamento scelto sul sito (bonifico, al ritiro) o il primo incasso registrato. */
  paymentMethod: string | null
}

export type SourceLine = {
  sku: string
  title: string
  subtitle: string
  quantity: number
  /** Unità: pz per i formati, L o kg per lo sfuso. */
  unit: string
  /** Totale della riga IVA inclusa e la sua IVA, come li ha calcolati Medusa. */
  total: number
  taxTotal: number
  rate: number
}

export type Carrier = 'mittente' | 'destinatario' | 'vettore'

export type DdtLine = { description: string; quantity: number; unit: string; lot: string }

export type DdtData = {
  seller: Seller
  recipient: Party
  /** Luogo di destinazione, se diverso dalla sede del destinatario. */
  destination: string
  orderCodes: string[]
  lines: DdtLine[]
  reason: string
  carrier: Carrier
  carrierName: string
  packages: number | null
  appearance: string
  weightKg: number | null
  transportStart: string
  notes: string
}

export type InvoiceLine = {
  description: string
  /** Riferimento della riga: "DDT n. 3/2026 del 10/11/2026" o "Ordine H3E5C26". */
  reference: string
  quantity: number
  unit: string
  /** Prezzo unitario e imponibile senza IVA. */
  unitNet: number
  net: number
  vatRate: number
  vat: number
}

export type VatRow = { rate: number; net: number; vat: number }

export type InvoiceData = {
  seller: Seller
  customer: Party
  lines: InvoiceLine[]
  vatSummary: VatRow[]
  netTotal: number
  vatTotal: number
  total: number
  paid: number
  due: number
  paymentMethod: string
  paymentTerms: string
  /** "Fattura differita": i DDT che raccoglie. */
  ddtReferences: string[]
  notes: string
}

export type DocumentRecord<T> = { id: string; kind: DocumentKind; year: number; number: number; issued_at: Date | string; status: 'issued' | 'canceled'; data: T }
