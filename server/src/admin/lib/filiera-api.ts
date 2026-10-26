import { toast } from '@medusajs/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AnalysisResults } from '../../modules/filiera/lib/analysis-values'
import { sdk } from './sdk'

// Tipi e accesso ai dati del back office della filiera. Le forme ricalcano le risposte di
// src/api/admin/filiera/*; le date arrivano come stringhe ISO.

export type ProductLine = 'olio' | 'miele'
export type Visibility = 'public' | 'legal' | 'internal'

export type StageField = { key: string; label: string; visibility: Visibility; required?: boolean; value: string | number | null }
export type LotStage = { id?: string; template_id?: string | null; name: string; position: number; date: string | null; place: string | null; fields: StageField[] }

export type Campaign = {
  id: string
  product_line: ProductLine
  label: string
  harvest_start: string | null
  harvest_end: string | null
  notes: string | null
  mill_id?: string | null
  mill?: { id: string; name: string } | null
  groves?: { id: string; name: string }[]
  apiaries?: { id: string; name: string }[]
  analyses?: Analysis[]
  lots?: { id: string; code: string; status: string }[]
}

export type Analysis = {
  id: string
  title: string
  lab: string | null
  date: string | null
  visibility: 'public' | 'internal'
  content_type?: string
  /** Testo del referto e valori letti; null per le analisi caricate prima della lettura automatica. */
  results?: AnalysisResults | null
}

export type Lot = {
  id: string
  code: string
  status: 'draft' | 'published'
  product_line: ProductLine
  product_name: string
  nominal_quantity: string | null
  origin: string
  packaging_date: string | null
  best_before: string | null
  units: number | null
  notes: string | null
  campaign_id: string
  campaign?: Campaign | null
  packaging_establishment_id: string | null
  packaging_establishment?: { id: string; name: string } | null
  stages?: LotStage[]
}

export type StageTemplate = {
  id: string
  product_line: ProductLine
  name: string
  position: number
  description: string | null
  active: boolean
  fields: { key: string; label: string; type: 'text' | 'number' | 'date'; visibility: Visibility; required: boolean }[]
}

export type RegistryKind = 'groves' | 'apiaries' | 'suppliers'
export type RegistryItem = { id: string; name: string; municipality: string; province: string | null } & Record<string, unknown>

export type SupplierType = { id: string; name: string; code: string | null }
export type Supplier = RegistryItem & {
  address: string | null
  vat_number: string | null
  internal_code: string | null
  email: string | null
  phone: string | null
  types?: SupplierType[]
}

/**
 * Fornitori adatti a un ruolo (tipologie di sistema, per codice). Se nessuno ha quelle tipologie
 * li propone tutti, per non bloccare chi non le ha ancora assegnate.
 */
export function suppliersFor(items: Supplier[], codes: string[]): Supplier[] {
  const matching = items.filter((item) => (item.types ?? []).some((type) => type.code && codes.includes(type.code)))
  return matching.length > 0 ? matching : items
}

const ROOT = ['filiera'] as const

export function useLots(query: { product_line?: ProductLine; status?: string; q?: string }) {
  return useQuery({
    queryKey: [...ROOT, 'lots', query],
    queryFn: () => sdk.client.fetch<{ lots: Lot[]; count: number }>('/admin/filiera/lots', { query }),
  })
}

export function useLot(id: string) {
  return useQuery({
    queryKey: [...ROOT, 'lot', id],
    queryFn: () =>
      sdk.client.fetch<{ lot: Lot; publish_blockers: string[]; public_url: string | null }>(`/admin/filiera/lots/${id}`),
  })
}

export function useCampaigns(productLine?: ProductLine) {
  return useQuery({
    queryKey: [...ROOT, 'campaigns', productLine ?? 'tutte'],
    queryFn: () =>
      sdk.client.fetch<{ campaigns: Campaign[] }>('/admin/filiera/campaigns', {
        query: productLine ? { product_line: productLine, limit: 200 } : { limit: 200 },
      }),
  })
}

export function useCampaign(id: string | null) {
  return useQuery({
    queryKey: [...ROOT, 'campaign', id],
    enabled: Boolean(id),
    queryFn: () => sdk.client.fetch<{ campaign: Campaign }>(`/admin/filiera/campaigns/${id}`),
  })
}

export function useRegistry(kind: RegistryKind) {
  return useQuery({
    queryKey: [...ROOT, 'registry', kind],
    queryFn: () => sdk.client.fetch<{ items: RegistryItem[] }>(`/admin/filiera/registries/${kind}`, { query: { limit: 200 } }),
  })
}

export function useSuppliers() {
  return useQuery({
    queryKey: [...ROOT, 'registry', 'suppliers'],
    queryFn: () => sdk.client.fetch<{ items: Supplier[] }>('/admin/filiera/registries/suppliers', { query: { limit: 200 } }),
  })
}

export function useSupplierTypes() {
  return useQuery({
    queryKey: [...ROOT, 'supplier-types'],
    queryFn: () => sdk.client.fetch<{ types: SupplierType[] }>('/admin/filiera/supplier-types'),
  })
}

export function useStageTemplates(productLine?: ProductLine) {
  return useQuery({
    queryKey: [...ROOT, 'templates', productLine ?? 'tutte'],
    queryFn: () =>
      sdk.client.fetch<{ templates: StageTemplate[] }>('/admin/filiera/stage-templates', {
        query: productLine ? { product_line: productLine } : {},
      }),
  })
}

type Action = { path: string; method?: 'POST' | 'DELETE'; body?: Record<string, unknown>; success?: string }

/** Unica mutazione per tutto il modulo: con volumi così bassi conviene ricaricare tutta la filiera. */
export function useFilieraAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ path, method = 'POST', body }: Action) => sdk.client.fetch<Record<string, unknown>>(path, { method, body }),
    onSuccess: (_data, action) => {
      queryClient.invalidateQueries({ queryKey: ROOT })
      if (action.success) toast.success(action.success)
    },
    onError: (error: Error) => toast.error(error.message || 'Operazione non riuscita.'),
  })
}

export const LINE_LABEL: Record<ProductLine, string> = { olio: 'Olio', miele: 'Miele' }

export function formatDate(value: string | null | undefined): string {
  if (!value) return 'non indicata'
  return new Date(value).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Da ISO a "AAAA-MM-GG" per <input type="date">. */
export function toDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : ''
}
