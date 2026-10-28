import type { AnalysisResults, AnalysisValue, NutritionBasis } from './analysis-values'

// Proiezione pubblica delle analisi (pagina Analisi e schede prodotto del sito): solo analisi
// «Pubbliche» di campagne con almeno un lotto pubblicato. Il referto (PDF e testo integrale) resta nel
// back office; sul sito escono solo i valori letti e controllati.

export type CampaignRecord = {
  product_line: 'olio' | 'miele'
  label: string
  harvest_start: string | null
  analyses: {
    id: string
    title: string
    lab: string | null
    date: string | null
    visibility: 'public' | 'internal'
    results: AnalysisResults | null
  }[]
  lots: { status: 'draft' | 'published' }[]
}

export type PublicAnalysis = {
  title: string
  lab: string | null
  date: string | null
  nutrition_basis: NutritionBasis
  values: AnalysisValue[]
}

export type PublicCampaignAnalyses = {
  product_line: CampaignRecord['product_line']
  campaign: string
  harvest_start: string | null
  analyses: PublicAnalysis[]
}

/** Le campagne dalla più recente: prima per inizio della raccolta, poi per nome ("2025/26"). */
function newestFirst(a: CampaignRecord, b: CampaignRecord): number {
  const byDate = (b.harvest_start ?? '').localeCompare(a.harvest_start ?? '')
  return byDate !== 0 ? byDate : b.label.localeCompare(a.label, 'it', { numeric: true })
}

type AnalysisRecord = CampaignRecord['analyses'][number]

/** Un'analisi come la vede il pubblico: solo i valori letti e controllati, mai il referto. */
export function toPublicAnalysis(analysis: AnalysisRecord): PublicAnalysis {
  return {
    title: analysis.title,
    lab: analysis.lab,
    date: analysis.date,
    nutrition_basis: analysis.results?.nutrition_basis ?? '100 g',
    values: (analysis.results?.values ?? []).filter((value) => value.value.trim() !== ''),
  }
}

export function toPublicAnalyses(campaigns: CampaignRecord[]): PublicCampaignAnalyses[] {
  return [...campaigns]
    .filter((campaign) => campaign.lots.some((lot) => lot.status === 'published'))
    .sort(newestFirst)
    .map((campaign) => ({
      product_line: campaign.product_line,
      campaign: campaign.label,
      harvest_start: campaign.harvest_start,
      analyses: campaign.analyses
        .filter((analysis) => analysis.visibility === 'public')
        .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
        .map(toPublicAnalysis),
    }))
    .filter((campaign) => campaign.analyses.length > 0)
}
