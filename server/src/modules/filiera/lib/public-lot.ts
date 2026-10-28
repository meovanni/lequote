// Proiezione pubblica di un lotto (ADR 0002): l'unico punto in cui si decide cosa vede il
// consumatore. Tutto ciò che è "internal" (registri SIAN, codici BDA, allegati interni) resta
// fuori; i campi "legal" finiscono nel pannello "Informazioni di legge", non nel racconto.

import type { AnalysisResults } from './analysis-values'
import { formatNominalQuantity } from './lot-label'
import { toPublicAnalysis, type PublicAnalysis } from './public-analyses'

export type Visibility = 'public' | 'legal' | 'internal'

export type StageFieldValue = {
  key: string
  label: string
  visibility: Visibility
  required?: boolean
  value: string | number | null
}

export type LotRecord = {
  code: string
  status: 'draft' | 'published'
  product_line: 'olio' | 'miele'
  product_name: string
  nominal_quantity: string | null
  best_before: string | null
  origin: string | null
  packaging_date: string | null
  campaign: {
    label: string
    harvest_start: string | null
    harvest_end: string | null
    analyses: {
      id: string
      title: string
      lab: string | null
      date: string | null
      visibility: 'public' | 'internal'
      results: AnalysisResults | null
    }[]
  } | null
  packaging_establishment: {
    name: string
    municipality: string | null
    province: string | null
  } | null
  stages: {
    name: string
    position: number
    date: string | null
    place: string | null
    fields: StageFieldValue[]
  }[]
}

export type LabelValue = { label: string; value: string }

export type PublicLot = {
  code: string
  product_line: LotRecord['product_line']
  product_name: string
  campaign: string | null
  stages: { name: string; date: string | null; place: string | null; fields: LabelValue[] }[]
  legal: LabelValue[]
  /** Analisi pubbliche della campagna con i loro valori, dalla più recente. */
  analyses: PublicAnalysis[]
}

function hasValue(value: string | number | null | undefined): value is string | number {
  return value !== null && value !== undefined && String(value).trim() !== ''
}

function pick(fields: StageFieldValue[], visibility: Visibility): LabelValue[] {
  return fields
    .filter((field) => field.visibility === visibility && hasValue(field.value))
    .map((field) => ({ label: field.label, value: String(field.value) }))
}

function establishmentLabel(establishment: NonNullable<LotRecord['packaging_establishment']>): string {
  const place = [establishment.name, establishment.municipality].filter(Boolean).join(', ')
  return establishment.province ? `${place} (${establishment.province})` : place
}

export function toPublicLot(lot: LotRecord): PublicLot | null {
  if (lot.status !== 'published') return null

  const stages = [...lot.stages].sort((a, b) => a.position - b.position)

  const fixedLegal: [string, string | null | undefined][] = [
    ['Lotto', lot.code],
    ['Origine', lot.origin],
    ['Quantità nominale', formatNominalQuantity(lot.nominal_quantity, lot.product_line)],
    ['Da consumarsi preferibilmente entro', lot.best_before],
    ['Data di confezionamento', lot.packaging_date],
    ['Confezionato da', lot.packaging_establishment ? establishmentLabel(lot.packaging_establishment) : null],
  ]

  const legal = [
    ...fixedLegal.filter(([, value]) => hasValue(value)).map(([label, value]) => ({ label, value: String(value) })),
    ...stages.flatMap((stage) => pick(stage.fields, 'legal')),
  ]

  return {
    code: lot.code,
    product_line: lot.product_line,
    product_name: lot.product_name,
    campaign: lot.campaign?.label ?? null,
    stages: stages.map((stage) => ({
      name: stage.name,
      date: stage.date,
      place: stage.place,
      fields: pick(stage.fields, 'public'),
    })),
    legal,
    analyses: (lot.campaign?.analyses ?? [])
      .filter((analysis) => analysis.visibility === 'public')
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
      .map(toPublicAnalysis),
  }
}
