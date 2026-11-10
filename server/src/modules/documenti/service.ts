import type { Context } from '@medusajs/framework/types'
import { InjectManager, InjectTransactionManager, MedusaContext, MedusaError, MedusaService } from '@medusajs/framework/utils'
import { documentYear, KIND_LABEL } from './lib/build'
import type { DocumentKind } from './lib/types'
import { SalesDocument, SalesDocumentOrder } from './models/document'

export type IssueInput = {
  kind: DocumentKind
  issuedAt: Date
  /** Numero scelto a mano (per proseguire una numerazione iniziata altrove); se manca, il successivo. */
  number?: number
  customerKey: string
  customerName: string
  total: number | null
  data: Record<string, unknown>
  issuedBy: string
  orderIds: string[]
}

/** Documenti emessi (non annullati) di ciascun ordine. */
export type OrderDocuments = Record<string, Partial<Record<DocumentKind, { id: string; number: number; year: number; issued_at: string }>>>

const invalid = (message: string): never => {
  throw new MedusaError(MedusaError.Types.NOT_ALLOWED, message)
}

type Execute = { execute: (sql: string, params: unknown[]) => Promise<unknown> }

class DocumentiModuleService extends MedusaService({ SalesDocument, SalesDocumentOrder }) {
  /** Il prossimo numero libero di un tipo di documento nell'anno. */
  @InjectManager()
  async nextNumber(kind: DocumentKind, year: number, @MedusaContext() context: Context = {}): Promise<number> {
    const [last] = await this.listSalesDocuments({ kind, year }, { order: { number: 'DESC' }, take: 1, select: ['id', 'number'] }, context)
    return (last?.number ?? 0) + 1
  }

  /**
   * Emette un documento con il numero successivo dell'anno (o quello scelto, se più alto). Un
   * blocco per tipo e anno fa sì che due emissioni contemporanee non prendano lo stesso numero.
   */
  @InjectTransactionManager()
  async issueDocument(input: IssueInput, @MedusaContext() context: Context = {}) {
    const manager = context.transactionManager as Execute | undefined
    if (typeof manager?.execute !== 'function') {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, 'Emissione del documento fuori da una transazione.')
    }
    const year = documentYear(input.issuedAt)
    await manager.execute('select pg_advisory_xact_lock(hashtext(?))', [`sales_document:${input.kind}:${year}`])

    const links = await this.listSalesDocumentOrders({ order_id: input.orderIds }, { relations: ['document'] }, context)
    const taken = links.find((link) => link.document?.kind === input.kind && link.document.status === 'issued')
    if (taken) {
      invalid(`Questo ordine ha già il ${KIND_LABEL[input.kind]} n. ${taken.document.number}/${taken.document.year}: annullalo prima di farne un altro.`)
    }

    const next = await this.nextNumber(input.kind, year, context)
    const number = input.number ?? next
    if (!Number.isInteger(number) || number < next) {
      invalid(`Il numero ${number}/${year} non è libero: il prossimo è ${next}.`)
    }

    const document = await this.createSalesDocuments(
      {
        kind: input.kind,
        year,
        number,
        issued_at: input.issuedAt,
        status: 'issued',
        customer_key: input.customerKey,
        customer_name: input.customerName,
        total: input.total,
        data: input.data,
        issued_by: input.issuedBy,
      },
      context,
    )
    await this.createSalesDocumentOrders(
      input.orderIds.map((order_id) => ({ order_id, document_id: document.id })),
      context,
    )
    return document
  }

  /** Annulla un documento: il numero resta (niente buchi), gli ordini tornano liberi. */
  @InjectTransactionManager()
  async cancelDocument(id: string, @MedusaContext() context: Context = {}) {
    const document = await this.retrieveSalesDocument(id, {}, context)
    if (document.status === 'canceled') invalid('Il documento è già annullato.')
    return this.updateSalesDocuments({ id, status: 'canceled' }, context)
  }

  @InjectManager()
  async documentsForOrders(orderIds: string[], @MedusaContext() context: Context = {}): Promise<OrderDocuments> {
    if (orderIds.length === 0) return {}
    const links = await this.listSalesDocumentOrders({ order_id: orderIds }, { relations: ['document'] }, context)
    const result: OrderDocuments = {}
    for (const link of links) {
      const document = link.document
      if (!document || document.status !== 'issued') continue
      result[link.order_id] = {
        ...result[link.order_id],
        [document.kind]: { id: document.id, number: document.number, year: document.year, issued_at: new Date(document.issued_at).toISOString() },
      }
    }
    return result
  }
}

export default DocumentiModuleService
