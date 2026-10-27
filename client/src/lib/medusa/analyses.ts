import type { Locale } from '@/i18n/locales'
import type { ProductLine } from '@/types'
import { storeFetch } from './client'

// Analisi pubbliche delle campagne (pagina /analisi e schede prodotto). Medusa manda solo i valori
// controllati nel back office: il referto (PDF e testo integrale) non arriva mai al browser
// (server/src/modules/filiera/lib/public-analyses.ts).

export type ValueGroup = 'chimica' | 'nutrizionale' | 'organolettica' | 'altro'

export interface AnalysisValue {
  key: string
  label: string
  group: ValueGroup
  /** Con il punto decimale ("0.21", "< 10") oppure un testo. */
  value: string
  unit: string | null
}

export interface PublicAnalysis {
  title: string
  lab: string | null
  date: string | null
  nutritionBasis: '100 g' | '100 ml'
  values: AnalysisValue[]
}

export interface CampaignAnalyses {
  productLine: ProductLine
  campaign: string
  analyses: PublicAnalysis[]
}

interface RawCampaign {
  product_line: ProductLine
  campaign: string
  analyses?: (Omit<PublicAnalysis, 'nutritionBasis'> & { nutrition_basis?: PublicAnalysis['nutritionBasis'] })[] | null
}

export function toCampaignAnalyses(raw: RawCampaign): CampaignAnalyses {
  return {
    productLine: raw.product_line,
    campaign: raw.campaign,
    analyses: (raw.analyses ?? []).map(({ nutrition_basis, ...analysis }) => ({
      ...analysis,
      nutritionBasis: nutrition_basis ?? '100 g',
      values: analysis.values ?? [],
    })),
  }
}

/** Campagne con analisi pubbliche, dalla più recente; `line` restringe a olio o miele. */
export async function listPublicAnalyses(line?: ProductLine): Promise<CampaignAnalyses[]> {
  const query = line ? `?line=${line}` : ''
  const { campaigns } = await storeFetch<{ campaigns: RawCampaign[] }>(`/store/filiera/analyses${query}`)
  return campaigns.map((campaign) => toCampaignAnalyses(campaign))
}

/** Valori della campagna più recente di una linea, per parametro: il primo referto che lo riporta. */
export interface LatestValues {
  campaign: string
  nutritionBasis: PublicAnalysis['nutritionBasis']
  byKey: Map<string, AnalysisValue>
}

export function latestValues(campaigns: CampaignAnalyses[], line: ProductLine): LatestValues | null {
  const latest = campaigns.find((campaign) => campaign.productLine === line && campaign.analyses.some((analysis) => analysis.values.length > 0))
  if (!latest) return null
  const byKey = new Map<string, AnalysisValue>()
  for (const analysis of latest.analyses) {
    for (const value of analysis.values) if (!byKey.has(value.key)) byKey.set(value.key, value)
  }
  const nutrition = latest.analyses.find((analysis) => analysis.values.some((value) => value.group === 'nutrizionale'))
  return { campaign: latest.campaign, nutritionBasis: nutrition?.nutritionBasis ?? '100 g', byKey }
}

const NUMERIC = /^([<>≤≥] ?)?\d+(\.\d+)?$/

/** "0.21" → "0,21" in italiano e tedesco; i testi restano come sono. */
export function formatAnalysisValue(locale: Locale, value: string): string {
  const trimmed = value.trim()
  if (!NUMERIC.test(trimmed) || locale === 'en') return trimmed
  return trimmed.replace('.', ',')
}

/** Intensità del panel test (scala 0-10) come frazione 0-1 per le barre; null se non è un numero. */
export function intensity(value: string | undefined): number | null {
  if (!value) return null
  const number = Number(value.replace(/^[<>≤≥]\s*/, ''))
  return Number.isFinite(number) ? Math.min(1, Math.max(0, number / 10)) : null
}
