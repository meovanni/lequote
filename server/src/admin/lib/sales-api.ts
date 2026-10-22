import { toast } from '@medusajs/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sdk } from './sdk'

// Tipi e accesso ai dati delle vendite: ordini dal gestionale, incassi, agenti, area vendita.
// Le forme ricalcano le risposte di src/api/admin/{backoffice,agents,sell}.

export type Variant = { variantId: string; sku: string; product: string; variant: string; price: number | null; stock: number | null }
export type DeliveryOption = { id: string; name: string; pickup: boolean; agent: boolean }
export type Catalog = { variants: Variant[]; delivery_options: DeliveryOption[]; agents?: { id: string; name: string }[] }

export type BookingLine = { id: string; variantId: string | null; sku: string; title: string; subtitle: string; quantity: number; unitPrice: number; total: number }
export type Booking = {
  id: string
  displayId: number
  createdAt: string
  status: string
  total: number
  paid: number
  due: number
  customer: string
  email: string | null
  phone: string | null
  delivery: string
  notes: string | null
  insertedBy: { type: string; name: string } | null
  lines: BookingLine[]
}

export type PaymentMethod = 'contanti' | 'bonifico' | 'assegno' | 'carta' | 'altro'
export type SalePayment = { id: string; amount: number; method: PaymentMethod; paid_at: string; recorded_by_name: string; notes: string | null }
export type PaymentState = { total: number; paid: number; due: number; payments: SalePayment[] }

export type Summary = {
  orders: number
  revenue: number
  paid: number
  outstanding: number
  quantity: number
  byProduct: { sku: string; label: string; quantity: number; total: number }[]
  byCustomer: { customer: string; orders: number; quantity: number; total: number }[]
}
/** Nell'area vendita degli agenti il fatturato manca: la classifica mostra solo i pezzi. */
export type RankingRow = { position: number; name: string; revenue?: number; quantity: number; me?: boolean }
export type Agent = { id: string; name: string; email: string | null; phone: string | null; active: boolean; notes: string | null }

export type Period = { from?: string; to?: string }

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  contanti: 'Contanti',
  bonifico: 'Bonifico',
  assegno: 'Assegno',
  carta: 'Carta',
  altro: 'Altro',
}

const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
export const formatEuro = (value: number) => euro.format(value)
export const formatDay = (value: string) => new Date(value).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })

const ROOT = ['vendite'] as const
const periodQuery = (period: Period) => Object.fromEntries(Object.entries(period).filter(([, value]) => value))

export function useBackofficeCatalog(enabled = true) {
  return useQuery({
    queryKey: [...ROOT, 'catalog', 'backoffice'],
    enabled,
    queryFn: () => sdk.client.fetch<Catalog>('/admin/backoffice/catalog'),
  })
}

export function useOrderSales(orderId: string) {
  return useQuery({
    queryKey: [...ROOT, 'order', orderId],
    queryFn: () =>
      sdk.client.fetch<{ booking: Booking; agent: { id: string; name: string } | null; payments: PaymentState }>(`/admin/backoffice/orders/${orderId}`),
  })
}

export function useAgents() {
  return useQuery({ queryKey: [...ROOT, 'agents'], queryFn: () => sdk.client.fetch<{ agents: Agent[] }>('/admin/agents') })
}

export function useAgentsSummary(period: Period) {
  return useQuery({
    queryKey: [...ROOT, 'agents-summary', period],
    queryFn: () =>
      sdk.client.fetch<{ agents: { agent: Pick<Agent, 'id' | 'name' | 'active'>; summary: Summary }[]; ranking: RankingRow[] }>(
        '/admin/agents/summary',
        { query: periodQuery(period) },
      ),
  })
}

export function useAgentDetail(id: string, period: Period) {
  return useQuery({
    queryKey: [...ROOT, 'agent', id, period],
    queryFn: () => sdk.client.fetch<{ agent: Agent; bookings: Booking[]; summary: Summary }>(`/admin/agents/${id}`, { query: periodQuery(period) }),
  })
}

export function useSellCatalog() {
  return useQuery({ queryKey: [...ROOT, 'catalog', 'sell'], queryFn: () => sdk.client.fetch<Catalog>('/admin/sell/catalog') })
}

export function useSellMe(period: Period) {
  return useQuery({
    queryKey: [...ROOT, 'sell-me', period],
    retry: false,
    queryFn: () =>
      sdk.client.fetch<{ agent: { id: string; name: string }; summary: Summary; ranking: RankingRow[] }>('/admin/sell/me', {
        query: periodQuery(period),
      }),
  })
}

export function useSellBookings(period: Period) {
  return useQuery({
    queryKey: [...ROOT, 'sell-bookings', period],
    queryFn: () => sdk.client.fetch<{ bookings: Booking[] }>('/admin/sell/bookings', { query: periodQuery(period) }),
  })
}

export function useSellBooking(id: string | null) {
  return useQuery({
    queryKey: [...ROOT, 'sell-booking', id],
    enabled: Boolean(id),
    queryFn: () => sdk.client.fetch<{ booking: Booking; payments: PaymentState }>(`/admin/sell/bookings/${id}`),
  })
}

type Action = { path: string; method?: 'POST' | 'DELETE'; body?: Record<string, unknown>; success?: string }

/** Unica mutazione delle vendite: dopo ogni operazione si ricarica tutto il necessario. */
export function useSalesAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ path, method = 'POST', body }: Action) => sdk.client.fetch<Record<string, unknown>>(path, { method, body }),
    onSuccess: (_data, action) => {
      queryClient.invalidateQueries({ queryKey: ROOT })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      if (action.success) toast.success(action.success)
    },
    onError: (error: Error) => toast.error(error.message || 'Operazione non riuscita.'),
  })
}
