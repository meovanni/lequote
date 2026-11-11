import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'
import { CONTENUTI_MODULE } from '../modules/contenuti'
import { FIELDS } from '../modules/contenuti/lib/schema'
import type ContenutiModuleService from '../modules/contenuti/service'
import { DOCUMENTI_MODULE } from '../modules/documenti'
import { buildDdt, buildInvoice, customerKey, defaultPackages, documentLabel, formatDay, invoiceBlocker, missingForDdt, missingForInvoice, partyAddress, type DdtInput, type InvoiceInput } from '../modules/documenti/lib/build'
import { renderDdt, renderInvoice } from '../modules/documenti/lib/pdf'
import type { DocumentKind, InvoiceData, Party, Seller, SourceOrder } from '../modules/documenti/lib/types'
import type DocumentiModuleService from '../modules/documenti/service'
import { formatOf, LINE_UNIT } from '../modules/magazzino/lib/formats'
import { VENDITE_MODULE } from '../modules/vendite'
import type VenditeModuleService from '../modules/vendite/service'
import { deliveryOf } from './magazzino'
import { orderCode } from './order-code'
import { PAYMENT_METHODS } from './order-emails'

// DDT e fatture dagli ordini di Medusa: lettura degli ordini, dati aziendali, emissione.

const ORDER_FIELDS = [
  'id',
  'display_id',
  'created_at',
  'status',
  'email',
  'total',
  'metadata',
  'shipping_address.*',
  'billing_address.*',
  'items.variant_sku',
  'items.title',
  'items.subtitle',
  'items.quantity',
  'items.total',
  'items.tax_total',
  'items.tax_lines.rate',
  'shipping_methods.name',
  'shipping_methods.total',
  'shipping_methods.tax_total',
  'shipping_methods.tax_lines.rate',
  'payment_collections.payments.provider_id',
]

type Address = { first_name?: string | null; last_name?: string | null; company?: string | null; phone?: string | null; address_1?: string | null; postal_code?: string | null; city?: string | null; province?: string | null } | null

type RawOrder = {
  id: string
  display_id: number
  created_at: string | Date
  status: string
  email: string | null
  total: number
  metadata: Record<string, unknown> | null
  shipping_address: Address
  billing_address: Address
  items: { variant_sku: string | null; title: string; subtitle: string | null; quantity: number; total: number; tax_total: number; tax_lines?: { rate: number }[] | null }[] | null
  shipping_methods: { name: string; total: number; tax_total: number; tax_lines?: { rate: number }[] | null }[] | null
  payment_collections?: { payments?: { provider_id: string }[] | null }[] | null
}

const PAYMENT_LABEL: Record<string, string> = { bonifico: 'Bonifico', ritiro: 'Al ritiro', contanti: 'Contanti', assegno: 'Assegno', carta: 'Carta', altro: 'Altro' }

const text = (value: unknown) => (typeof value === 'string' ? value : '')

function customerOf(order: RawOrder): Party {
  const address = order.billing_address?.address_1 ? order.billing_address : order.shipping_address
  const meta = (order.metadata?.customer ?? {}) as Record<string, unknown>
  const company = text(address?.company) || text(order.shipping_address?.company)
  const person = [address?.first_name, address?.last_name].filter(Boolean).join(' ')
  const kind = meta.kind === 'azienda' || company ? 'azienda' : 'privato'
  return {
    kind,
    name: kind === 'azienda' && company ? company : person,
    address: text(address?.address_1),
    postalCode: text(address?.postal_code),
    city: text(address?.city),
    province: text(address?.province),
    vat: text(meta.vat_number),
    fiscalCode: text(meta.fiscal_code),
    sdiCode: text(meta.sdi_code),
    pec: text(meta.pec),
    email: order.email ?? '',
    phone: text(address?.phone),
  }
}

function unitOf(sku: string): string {
  const format = formatOf(sku)
  return format?.bulk ? LINE_UNIT[format.line] : 'pz'
}

export async function loadSourceOrders(container: MedusaContainer, ids: string[]): Promise<SourceOrder[]> {
  if (ids.length === 0) return []
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: 'order', fields: ORDER_FIELDS, filters: { id: ids } })
  const vendite: VenditeModuleService = container.resolve(VENDITE_MODULE)
  const payments = await vendite.listSalePayments({ order_id: ids })
  return (data as unknown as RawOrder[]).map((order) => {
    const own = payments.filter((payment) => payment.order_id === order.id).sort((a, b) => new Date(a.paid_at).getTime() - new Date(b.paid_at).getTime())
    const provider = order.payment_collections?.[0]?.payments?.[0]?.provider_id ?? ''
    const method = PAYMENT_METHODS[provider] ?? own[0]?.method ?? null
    return {
      id: order.id,
      code: orderCode(order.display_id, order.created_at),
      createdAt: new Date(order.created_at).toISOString(),
      status: order.status,
      delivered: deliveryOf(order.metadata) !== null,
      customer: customerOf(order),
      items: (order.items ?? []).map((item) => ({
        sku: item.variant_sku ?? '',
        title: item.title,
        subtitle: item.subtitle ?? '',
        quantity: Number(item.quantity),
        unit: unitOf(item.variant_sku ?? ''),
        total: Number(item.total),
        taxTotal: Number(item.tax_total),
        rate: Number(item.tax_lines?.[0]?.rate ?? 0),
      })),
      shipping: (order.shipping_methods ?? []).map((method) => ({
        name: method.name,
        total: Number(method.total),
        taxTotal: Number(method.tax_total),
        rate: Number(method.tax_lines?.[0]?.rate ?? 0),
      })),
      total: Number(order.total),
      paid: own.reduce((sum, payment) => sum + Number(payment.amount), 0),
      paymentMethod: method ? (PAYMENT_LABEL[method] ?? method) : null,
    }
  })
}

const SHARED_DEFAULTS: Record<string, string> = Object.fromEntries(
  [...FIELDS.values()].flatMap((field) => (field.key.startsWith('business.') ? [[field.key, field.defaults.shared ?? '']] : [])),
)

/** I dati aziendali pubblicati (Contenuti › Dati aziendali), quelli di partenza dove non cambiati. */
export async function sellerData(container: MedusaContainer): Promise<Seller> {
  const published = await container.resolve<ContenutiModuleService>(CONTENUTI_MODULE).publishedShared()
  const value = (key: string) => (published[`business.${key}`] ?? SHARED_DEFAULTS[`business.${key}`] ?? '').trim()
  return {
    name: value('SELLER.name'),
    address: value('SELLER.address'),
    vat: value('SELLER.vat'),
    email: value('SELLER.email'),
    pec: value('SELLER.pec'),
    phone: value('SELLER.phone'),
    iban: value('BANK_TRANSFER.iban'),
    bankHolder: value('BANK_TRANSFER.holder'),
  }
}

const documenti = (container: MedusaContainer): DocumentiModuleService => container.resolve(DOCUMENTI_MODULE)

const blocked = (message: string): never => {
  throw new MedusaError(MedusaError.Types.NOT_ALLOWED, message)
}

/** Quello che serve al modulo del DDT: i dati di partenza presi dall'ordine. */
export async function ddtDraft(container: MedusaContainer, orderId: string) {
  const [order] = await loadSourceOrders(container, [orderId])
  if (!order) throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Ordine non trovato.')
  return { recipient: order.customer, packages: defaultPackages(order), lines: order.items.map((item) => ({ description: [item.title, item.subtitle].filter(Boolean).join(' - '), quantity: item.quantity, unit: item.unit })) }
}

export async function issueDdt(container: MedusaContainer, orderId: string, input: Omit<DdtInput, 'transportStart'> & { transportStart?: Date }, issuedBy: string) {
  const [order] = await loadSourceOrders(container, [orderId])
  if (!order) throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Ordine non trovato.')
  if (order.status === 'canceled') blocked('L’ordine è annullato: niente DDT.')
  const missing = missingForDdt(input.recipient, input.destination ?? '')
  if (missing.length > 0) blocked(`Per il DDT mancano: ${missing.join(', ')}.`)
  const issuedAt = new Date()
  const data = buildDdt(order, { ...input, transportStart: input.transportStart ?? issuedAt }, await sellerData(container))
  return documenti(container).issueDocument({
    kind: 'ddt',
    issuedAt,
    customerKey: customerKey(data.recipient),
    customerName: data.recipient.name,
    total: null,
    data,
    issuedBy,
    orderIds: [order.id],
  })
}

/** Ordini che si possono ancora fatturare (non annullati, senza fattura), raggruppati per cliente. */
export async function invoiceCandidates(container: MedusaContainer, orderIds: string[]) {
  const service = documenti(container)
  const docs = await service.documentsForOrders(orderIds)
  const open = (await loadSourceOrders(container, orderIds)).filter((order) => order.status !== 'canceled' && !docs[order.id]?.fattura)
  const groups = new Map<string, { key: string; customer: Party; orders: { id: string; code: string; createdAt: string; total: number; delivered: boolean; ddt: string | null }[] }>()
  for (const order of open) {
    const key = customerKey(order.customer)
    const ddt = docs[order.id]?.ddt
    const group = groups.get(key) ?? { key, customer: order.customer, orders: [] }
    group.orders.push({ id: order.id, code: order.code, createdAt: order.createdAt, total: order.total, delivered: order.delivered, ddt: ddt ? documentLabel('ddt', ddt.number, ddt.year, ddt.issued_at) : null })
    groups.set(key, group)
  }
  return [...groups.values()].sort((a, b) => a.customer.name.localeCompare(b.customer.name, 'it'))
}

export async function issueInvoice(container: MedusaContainer, orderIds: string[], input: InvoiceInput & { number?: number; issuedAt?: Date }, issuedBy: string) {
  const service = documenti(container)
  const orders = await loadSourceOrders(container, orderIds)
  if (orders.length !== new Set(orderIds).size) throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Uno degli ordini non esiste.')
  const docs = await service.documentsForOrders(orderIds)
  const invoiced = new Set(Object.entries(docs).flatMap(([id, entry]) => (entry.fattura ? [id] : [])))
  const blocker = invoiceBlocker(orders, invoiced)
  if (blocker) blocked(blocker)
  const missing = missingForInvoice(input.customer)
  if (missing.length > 0) blocked(`Per la fattura mancano: ${missing.join(', ')}.`)
  const ddtByOrder = new Map(Object.entries(docs).flatMap(([id, entry]) => (entry.ddt ? [[id, documentLabel('ddt', entry.ddt.number, entry.ddt.year, entry.ddt.issued_at)]] : [])))
  const data = buildInvoice(orders, ddtByOrder, input, await sellerData(container))
  return service.issueDocument({
    kind: 'fattura',
    issuedAt: input.issuedAt ?? new Date(),
    number: input.number,
    customerKey: customerKey(data.customer),
    customerName: data.customer.name,
    total: data.total,
    data,
    issuedBy,
    orderIds: orders.map((order) => order.id),
  })
}

export type DocumentRow = {
  id: string
  kind: DocumentKind
  number: number
  year: number
  issuedAt: string
  status: 'issued' | 'canceled'
  customer: string
  total: number | null
  orderIds: string[]
  label: string
}

export async function listDocuments(container: MedusaContainer, filters: { kind?: DocumentKind; year?: number } = {}): Promise<DocumentRow[]> {
  const rows = await documenti(container).listSalesDocuments(
    { ...(filters.kind ? { kind: filters.kind } : {}), ...(filters.year ? { year: filters.year } : {}) },
    { relations: ['orders'], order: { year: 'DESC', number: 'DESC' }, take: 1000 },
  )
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    number: row.number,
    year: row.year,
    issuedAt: new Date(row.issued_at).toISOString(),
    status: row.status,
    customer: row.customer_name,
    total: row.total === null || row.total === undefined ? null : Number(row.total),
    orderIds: (row.orders ?? []).map((link) => link.order_id),
    label: documentLabel(row.kind, row.number, row.year, row.issued_at),
  }))
}

/** Il PDF di un documento, con il nome del file da scaricare. */
export async function documentPdf(container: MedusaContainer, id: string): Promise<{ file: Buffer; name: string }> {
  const document = await documenti(container).retrieveSalesDocument(id)
  const record = { ...document, data: document.data as never }
  const file = document.kind === 'ddt' ? await renderDdt(record) : await renderInvoice(record)
  const name = `${document.kind === 'ddt' ? 'DDT' : 'Fattura'}-${document.number}-${document.year}.pdf`
  return { file, name }
}

/**
 * Una cella del CSV. I testi (nomi, indirizzi, PEC) arrivano anche da clienti e agenti: se
 * cominciano come una formula (= + - @, tab, a capo) Excel li eseguirebbe, quindi si premette un
 * apostrofo e restano testo.
 */
export const csvCell = (value: string | number) => {
  const raw = typeof value === 'number' ? value.toFixed(2).replace('.', ',') : /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return /[";\r\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw
}

/** Riepilogo delle fatture dell'anno per il commercialista: una riga per aliquota di ogni fattura. */
export async function invoiceSummaryCsv(container: MedusaContainer, year: number): Promise<string> {
  const rows = await documenti(container).listSalesDocuments({ kind: 'fattura', year }, { order: { number: 'ASC' }, take: 10_000 })
  const head = ['Numero', 'Data', 'Stato', 'Cliente', 'P.IVA', 'Codice fiscale', 'Codice SDI', 'PEC', 'Indirizzo', 'Aliquota IVA', 'Imponibile', 'IVA', 'Totale fattura', 'DDT']
  const lines = rows.flatMap((row) => {
    const data = row.data as unknown as InvoiceData
    return data.vatSummary.map((vat) => [
      `${row.number}/${row.year}`,
      formatDay(row.issued_at),
      row.status === 'canceled' ? 'Annullata' : 'Emessa',
      data.customer.name,
      data.customer.vat,
      data.customer.fiscalCode,
      data.customer.sdiCode,
      data.customer.pec,
      partyAddress(data.customer),
      `${vat.rate}%`,
      vat.net,
      vat.vat,
      data.total,
      data.ddtReferences.join('; '),
    ])
  })
  // Punto e virgola e BOM: Excel in italiano lo apre già in colonne, con gli accenti giusti.
  return '﻿' + [head, ...lines].map((line) => line.map(csvCell).join(';')).join('\r\n') + '\r\n'
}

export function sendPdf(res: { setHeader: (name: string, value: string) => unknown; send: (body: Buffer) => unknown }, file: Buffer, name: string, download: boolean) {
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `${download ? 'attachment' : 'inline'}; filename="${name}"`)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', 'private, no-store')
  res.send(file)
}
