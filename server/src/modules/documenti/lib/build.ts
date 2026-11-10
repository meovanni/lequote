import type { Carrier, DdtData, DocumentKind, InvoiceData, InvoiceLine, Party, Seller, SourceOrder, VatRow } from './types'

// DDT e fatture dagli ordini, senza database: cosa manca per emetterli e cosa si stampa.

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

const DAY = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Rome' })

/** "10/11/2026", all'ora italiana. */
export const formatDay = (value: Date | string) => DAY.format(new Date(value))

/** Anno del documento, all'ora italiana: un DDT del 31 dicembre alle 23:30 è dell'anno che finisce. */
export const documentYear = (value: Date) => Number(new Intl.DateTimeFormat('it-IT', { year: 'numeric', timeZone: 'Europe/Rome' }).format(value))

export const KIND_LABEL: Record<DocumentKind, string> = { ddt: 'DDT', fattura: 'Fattura' }

/** "DDT n. 3/2026 del 10/11/2026". */
export function documentLabel(kind: DocumentKind, number: number, year: number, issuedAt: Date | string): string {
  return `${KIND_LABEL[kind]} n. ${number}/${year} del ${formatDay(issuedAt)}`
}

const clean = (value: string | null | undefined) => (value ?? '').replace(/\s+/g, ' ').trim()

/** Stesso cliente per le fatture differite: la P.IVA, altrimenti il codice fiscale, altrimenti il nome. */
export function customerKey(party: Pick<Party, 'vat' | 'fiscalCode' | 'name'>): string {
  const vat = clean(party.vat).replace(/\s/g, '')
  if (vat) return `piva:${vat}`
  const fiscalCode = clean(party.fiscalCode).replace(/\s/g, '').toUpperCase()
  if (fiscalCode) return `cf:${fiscalCode}`
  return `nome:${clean(party.name).toLowerCase()}`
}

/** "Via Roma 1, 64026 Roseto degli Abruzzi (TE)". */
export function partyAddress(party: Pick<Party, 'address' | 'postalCode' | 'city' | 'province'>): string {
  const place = [clean(party.postalCode), clean(party.city), clean(party.province) ? `(${clean(party.province).toUpperCase()})` : ''].filter(Boolean).join(' ')
  return [clean(party.address), place].filter(Boolean).join(', ')
}

/** Dati obbligatori del destinatario di un DDT (DPR 472/1996): chi è e dove va la merce. */
export function missingForDdt(recipient: Party, destination: string): string[] {
  const missing: string[] = []
  if (!clean(recipient.name)) missing.push('nome del destinatario')
  if (!clean(recipient.address) && !clean(destination)) missing.push('indirizzo o luogo di destinazione')
  return missing
}

/** Dati del cliente senza i quali il commercialista non può emettere la fattura (art. 21 DPR 633/72). */
export function missingForInvoice(customer: Party): string[] {
  const missing: string[] = []
  const azienda = customer.kind === 'azienda'
  if (!clean(customer.name)) missing.push(azienda ? 'ragione sociale' : 'nome e cognome')
  if (azienda && !/^\d{11}$/.test(clean(customer.vat))) missing.push('partita IVA (11 cifre)')
  if (!azienda && !/^[A-Z0-9]{16}$/i.test(clean(customer.fiscalCode))) missing.push('codice fiscale (16 caratteri)')
  if (!clean(customer.address)) missing.push('indirizzo')
  if (!/^\d{5}$/.test(clean(customer.postalCode))) missing.push('CAP')
  if (!clean(customer.city)) missing.push('comune')
  if (clean(customer.sdiCode) && !/^[A-Z0-9]{7}$/i.test(clean(customer.sdiCode))) missing.push('codice destinatario SDI valido (7 caratteri)')
  return missing
}

export function normalizeParty(party: Party): Party {
  return {
    kind: party.kind,
    name: clean(party.name),
    address: clean(party.address),
    postalCode: clean(party.postalCode),
    city: clean(party.city),
    province: clean(party.province).toUpperCase(),
    vat: clean(party.vat).replace(/\s/g, ''),
    fiscalCode: clean(party.fiscalCode).replace(/\s/g, '').toUpperCase(),
    sdiCode: clean(party.sdiCode).toUpperCase(),
    pec: clean(party.pec),
    email: clean(party.email),
    phone: clean(party.phone),
  }
}

const lineDescription = (title: string, subtitle: string) => [clean(title), clean(subtitle)].filter(Boolean).join(' - ')

export type DdtInput = {
  recipient: Party
  destination?: string
  reason?: string
  carrier?: Carrier
  carrierName?: string
  packages?: number | null
  appearance?: string
  weightKg?: number | null
  transportStart: Date
  /** Lotto di ogni riga, nello stesso ordine delle righe dell'ordine. */
  lots?: string[]
  notes?: string
}

/** Colli di partenza: un pezzo è un collo; lo sfuso in litri o chili non si conta. */
export function defaultPackages(order: SourceOrder): number | null {
  const pieces = order.items.filter((item) => item.unit === 'pz').reduce((sum, item) => sum + item.quantity, 0)
  return pieces > 0 ? pieces : null
}

export function buildDdt(order: SourceOrder, input: DdtInput, seller: Seller): DdtData {
  return {
    seller,
    recipient: normalizeParty(input.recipient),
    destination: clean(input.destination),
    orderCodes: [order.code],
    lines: order.items.map((item, index) => ({
      description: lineDescription(item.title, item.subtitle),
      quantity: item.quantity,
      unit: item.unit,
      lot: clean(input.lots?.[index]),
    })),
    reason: clean(input.reason) || 'Vendita',
    carrier: input.carrier ?? 'mittente',
    carrierName: input.carrier === 'vettore' ? clean(input.carrierName) : '',
    packages: input.packages ?? null,
    appearance: clean(input.appearance) || 'Scatole',
    weightKg: input.weightKg ?? null,
    transportStart: input.transportStart.toISOString(),
    notes: clean(input.notes),
  }
}

export type InvoiceInput = {
  customer: Party
  paymentTerms?: string
  notes?: string
}

function invoiceLines(order: SourceOrder, reference: string): InvoiceLine[] {
  const goods = order.items.map((item) => {
    const net = round2(item.total - item.taxTotal)
    return {
      description: lineDescription(item.title, item.subtitle),
      reference,
      quantity: item.quantity,
      unit: item.unit,
      unitNet: item.quantity > 0 ? Math.round((net / item.quantity) * 10_000) / 10_000 : 0,
      net,
      vatRate: item.rate,
      vat: round2(item.taxTotal),
    }
  })
  const shipping = order.shipping
    .filter((method) => method.total > 0)
    .map((method) => {
      const net = round2(method.total - method.taxTotal)
      return { description: `Spedizione - ${clean(method.name)}`, reference, quantity: 1, unit: 'pz', unitNet: net, net, vatRate: method.rate, vat: round2(method.taxTotal) }
    })
  return [...goods, ...shipping]
}

export function vatSummary(lines: InvoiceLine[]): VatRow[] {
  const byRate = new Map<number, VatRow>()
  for (const line of lines) {
    const row = byRate.get(line.vatRate) ?? { rate: line.vatRate, net: 0, vat: 0 }
    byRate.set(line.vatRate, { rate: line.vatRate, net: round2(row.net + line.net), vat: round2(row.vat + line.vat) })
  }
  return [...byRate.values()].sort((a, b) => a.rate - b.rate)
}

/** Perché questi ordini non possono stare nella stessa fattura; null se possono. */
export function invoiceBlocker(orders: SourceOrder[], invoiced: Set<string>): string | null {
  if (orders.length === 0) return 'Scegli almeno un ordine.'
  const canceled = orders.find((order) => order.status === 'canceled')
  if (canceled) return `L’ordine ${canceled.code} è annullato.`
  const already = orders.find((order) => invoiced.has(order.id))
  if (already) return `L’ordine ${already.code} è già in una fattura.`
  const keys = new Set(orders.map((order) => customerKey(order.customer)))
  if (keys.size > 1) return 'Gli ordini sono di clienti diversi: una fattura è per un solo cliente.'
  return null
}

/**
 * Fattura (copia di cortesia) per uno o più ordini dello stesso cliente. Gli ordini con DDT
 * fanno una fattura differita: le righe richiamano il DDT, che si elenca anche in testa.
 */
export function buildInvoice(orders: SourceOrder[], ddtByOrder: Map<string, string>, input: InvoiceInput, seller: Seller): InvoiceData {
  const sorted = [...orders].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const lines = sorted.flatMap((order) => invoiceLines(order, ddtByOrder.get(order.id) ?? `Ordine ${order.code}`))
  const summary = vatSummary(lines)
  const netTotal = round2(summary.reduce((sum, row) => sum + row.net, 0))
  const vatTotal = round2(summary.reduce((sum, row) => sum + row.vat, 0))
  const total = round2(netTotal + vatTotal)
  const paid = round2(Math.min(total, sorted.reduce((sum, order) => sum + order.paid, 0)))
  const methods = [...new Set(sorted.map((order) => order.paymentMethod).filter((method): method is string => Boolean(method)))]
  return {
    seller,
    customer: normalizeParty(input.customer),
    lines,
    vatSummary: summary,
    netTotal,
    vatTotal,
    total,
    paid,
    due: round2(total - paid),
    paymentMethod: methods.join(', '),
    paymentTerms: clean(input.paymentTerms),
    ddtReferences: sorted.flatMap((order) => (ddtByOrder.has(order.id) ? [ddtByOrder.get(order.id) as string] : [])),
    notes: clean(input.notes),
  }
}
