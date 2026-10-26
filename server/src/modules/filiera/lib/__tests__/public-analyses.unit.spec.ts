import { toPublicAnalyses, type CampaignRecord } from '../public-analyses'

const acidity = { key: 'acidita', label: 'Acidità libera', group: 'chimica' as const, value: '0.21', unit: '% acido oleico' }

const campaign = (label: string, harvest: string | null, overrides: Partial<CampaignRecord> = {}): CampaignRecord => ({
  product_line: 'olio',
  label,
  harvest_start: harvest,
  analyses: [
    {
      id: `anl_${label.replace('/', '')}aaaaaaaaaa`,
      title: 'Chimica',
      lab: 'Lab',
      date: '2025-11-20',
      visibility: 'public',
      results: { markdown: 'testo integrale', values: [acidity, { ...acidity, key: 'vuoto', value: ' ' }], nutrition_basis: '100 g' },
    },
    { id: 'anl_internalaaaaaaaa', title: 'Interna', lab: null, date: null, visibility: 'internal', results: null },
  ],
  lots: [{ status: 'published' }],
  ...overrides,
})

describe('toPublicAnalyses', () => {
  it('mostra solo analisi pubbliche di campagne con un lotto pubblicato, dalla più recente', () => {
    const result = toPublicAnalyses([
      campaign('2024/25', '2024-10-15'),
      campaign('2025/26', '2025-10-15'),
      campaign('2026/27', '2026-10-15', { lots: [{ status: 'draft' }] }),
    ])
    expect(result.map((entry) => entry.campaign)).toEqual(['2025/26', '2024/25'])
    expect(result[0].analyses).toHaveLength(1)
    expect(result[0].analyses[0]).toEqual({
      title: 'Chimica',
      lab: 'Lab',
      date: '2025-11-20',
      url: '/filiera/analisi/anl_202526aaaaaaaaaa',
      nutrition_basis: '100 g',
      values: [acidity],
    })
  })

  it('non espone mai il testo integrale del referto', () => {
    expect(JSON.stringify(toPublicAnalyses([campaign('2025/26', null)]))).not.toContain('testo integrale')
  })

  it('salta le campagne senza analisi pubbliche', () => {
    expect(toPublicAnalyses([campaign('2025/26', null, { analyses: [] })])).toEqual([])
  })
})
