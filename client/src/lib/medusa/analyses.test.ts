import { describe, expect, it } from 'vitest'
import { formatAnalysisValue, intensity, latestValues, toCampaignAnalyses, type CampaignAnalyses } from './analyses'
import { valueRows } from '@/lib/analysisDisplay'

const value = (key: string, v: string, group: 'chimica' | 'nutrizionale' | 'organolettica' = 'chimica', unit: string | null = null) => ({
  key,
  label: key,
  group,
  value: v,
  unit,
})

describe('analisi pubbliche', () => {
  it('porta solo i valori, senza alcun link al referto', () => {
    const campaign = toCampaignAnalyses({
      product_line: 'olio',
      campaign: '2025/26',
      analyses: [{ title: 'T', lab: null, date: null, values: [], nutrition_basis: '100 ml' }],
    })
    expect(campaign.analyses[0]).toEqual({ title: 'T', lab: null, date: null, values: [], nutritionBasis: '100 ml' })
  })

  it('prende i valori della campagna più recente della linea, il primo referto per parametro', () => {
    const campaigns: CampaignAnalyses[] = [
      { productLine: 'miele', campaign: '2026', analyses: [{ title: 'M', lab: null, date: null, nutritionBasis: '100 g', values: [value('umidita', '17')] }] },
      {
        productLine: 'olio',
        campaign: '2025/26',
        analyses: [
          { title: 'A', lab: null, date: null, nutritionBasis: '100 g', values: [value('acidita', '0.21')] },
          { title: 'B', lab: null, date: null, nutritionBasis: '100 ml', values: [value('acidita', '0.3'), value('grassi', '91.6', 'nutrizionale')] },
        ],
      },
      { productLine: 'olio', campaign: '2024/25', analyses: [{ title: 'C', lab: null, date: null, nutritionBasis: '100 g', values: [value('acidita', '0.4')] }] },
    ]
    const latest = latestValues(campaigns, 'olio')
    expect(latest?.campaign).toBe('2025/26')
    expect(latest?.byKey.get('acidita')?.value).toBe('0.21')
    expect(latest?.nutritionBasis).toBe('100 ml')
    expect(latestValues([], 'olio')).toBeNull()
  })

  it('usa la virgola decimale in italiano e tedesco, non nei testi', () => {
    expect(formatAnalysisValue('it', '0.21')).toBe('0,21')
    expect(formatAnalysisValue('de', '< 0.1')).toBe('< 0,1')
    expect(formatAnalysisValue('en', '0.21')).toBe('0.21')
    expect(formatAnalysisValue('it', 'erba, carciofo')).toBe('erba, carciofo')
  })

  it('porta le intensità del panel test su 0-1', () => {
    expect(intensity('5.2')).toBeCloseTo(0.52)
    expect(intensity('12')).toBe(1)
    expect(intensity('assente')).toBeNull()
    expect(intensity(undefined)).toBeNull()
  })
})

describe('valueRows', () => {
  const labels = { valueLabels: { energia_kj: 'Energia', acidita: 'Acidità libera' }, units: { acidita: '% acido oleico' } }

  it('traduce le etichette note e mette l’unità accanto al valore', () => {
    expect(valueRows([value('acidita', '0.21')], 'chimica', 'it', labels)).toEqual([{ key: 'acidita', label: 'Acidità libera', value: '0,21 % acido oleico' }])
    expect(valueRows([value('x_ferro', '2', 'chimica', 'mg')], 'chimica', 'it', labels)).toEqual([{ key: 'x_ferro', label: 'x_ferro', value: '2 mg' }])
  })

  it('unisce kJ e kcal in una riga Energia', () => {
    const rows = valueRows(
      [value('energia_kj', '3389', 'nutrizionale', 'kJ'), value('energia_kcal', '824', 'nutrizionale', 'kcal'), value('grassi', '91.6', 'nutrizionale', 'g')],
      'nutrizionale',
      'it',
      labels,
    )
    expect(rows.map((row) => row.value)).toEqual(['3389 kJ / 824 kcal', '91,6 g'])
  })
})

describe('ordine delle righe', () => {
  it('segue l’ordine di etichetta, con i parametri aggiunti a mano in fondo', () => {
    const labels = { valueLabels: { grassi: 'Grassi', saturi: 'di cui saturi' }, units: {} }
    const rows = valueRows([value('x_omega', '1', 'nutrizionale'), value('saturi', '14', 'nutrizionale'), value('grassi', '91', 'nutrizionale')], 'nutrizionale', 'en', labels)
    expect(rows.map((row) => row.key)).toEqual(['grassi', 'saturi', 'x_omega'])
  })
})
