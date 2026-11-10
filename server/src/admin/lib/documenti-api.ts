import { useQuery } from '@tanstack/react-query'
import { sdk } from './sdk'

// DDT e fatture (src/api/admin/documenti). Le chiavi stanno sotto "vendite": useSalesAction le
// ricarica dopo ogni emissione o annullamento, insieme a ordini e magazzino.

export type DocumentKind = 'ddt' | 'fattura'

export type Party = {
  kind: 'privato' | 'azienda'
  name: string
  address: string
  postalCode: string
  city: string
  province: string
  vat: string
  fiscalCode: string
  sdiCode: string
  pec: string
  email: string
  phone: string
}

export type DocumentRef = { id: string; number: number; year: number; issued_at: string }

export type OrderDocuments = Partial<Record<DocumentKind, DocumentRef>>

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

export type DdtDraft = { recipient: Party; packages: number | null; lines: { description: string; quantity: number; unit: string }[] }

export type InvoiceCandidate = {
  key: string
  customer: Party
  orders: { id: string; code: string; createdAt: string; total: number; delivered: boolean; ddt: string | null }[]
}

const BACKEND = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '')

/** Il PDF passa dalla sessione del back office, come le richieste dell'SDK. */
export const documentPdfUrl = (id: string) => `${BACKEND}/admin/documenti/${id}/pdf`
export const agentDdtPdfUrl = (orderId: string) => `${BACKEND}/admin/sell/bookings/${orderId}/ddt/pdf`
export const invoiceSummaryUrl = (year: number) => `${BACKEND}/admin/documenti/riepilogo?year=${year}`

export const KIND_LABEL: Record<DocumentKind, string> = { ddt: 'DDT', fattura: 'Fattura' }

export const refLabel = (kind: DocumentKind, ref: DocumentRef) =>
  `${KIND_LABEL[kind]} n. ${ref.number}/${ref.year} del ${new Date(ref.issued_at).toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' })}`

export function useDocuments() {
  return useQuery({
    queryKey: ['vendite', 'documenti'],
    queryFn: () => sdk.client.fetch<{ documents: DocumentRow[]; year: number; next: Record<DocumentKind, number> }>('/admin/documenti'),
  })
}

export function useInvoiceCandidates(enabled: boolean) {
  return useQuery({
    queryKey: ['vendite', 'documenti', 'candidati'],
    queryFn: () => sdk.client.fetch<{ customers: InvoiceCandidate[] }>('/admin/documenti/candidati'),
    enabled,
  })
}

/** `path` è la rotta del DDT dell'ordine: quella di Gestione o, per gli agenti, dell'area vendita. */
export function useDdtDraft(path: string, enabled: boolean) {
  return useQuery({
    queryKey: ['vendite', 'documenti', 'ddt-draft', path],
    queryFn: () => sdk.client.fetch<{ draft: DdtDraft }>(path),
    enabled,
    staleTime: 0,
  })
}
