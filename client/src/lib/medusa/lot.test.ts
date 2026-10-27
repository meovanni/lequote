import { describe, expect, it } from 'vitest'
import { toPublicLot } from './lot'

describe('toPublicLot', () => {
  it('conserva l’ordine delle fasi e porta i referti all’indirizzo del back end', () => {
    const lot = toPublicLot(
      {
        code: 'L2026-07',
        product_line: 'olio',
        product_name: 'Olio extravergine di oliva',
        campaign: '2025/26',
        stages: [
          { name: 'Raccolta', date: '2025-10-20', place: 'Roseto degli Abruzzi', fields: [{ label: 'Varietà', value: 'Leccino' }] },
          { name: 'Molitura', date: null, place: null, fields: [] },
        ],
        legal: [{ label: 'Lotto', value: 'L2026-07' }],
        analyses: [{ title: 'Analisi chimica', lab: 'Lab Teramo', date: '2025-11-02' }],
      },
    )
    expect(lot.code).toBe('L2026-07')
    expect(lot.stages.map((stage) => stage.name)).toEqual(['Raccolta', 'Molitura'])
    expect(lot.analyses[0]).toEqual({ title: 'Analisi chimica', lab: 'Lab Teramo', date: '2025-11-02' })
  })

  it('regge campi mancanti senza inventare dati', () => {
    const lot = toPublicLot({ code: 'L2026-08', product_line: 'miele', product_name: 'Miele' })
    expect(lot.campaign).toBeNull()
    expect(lot.stages).toEqual([])
    expect(lot.legal).toEqual([])
    expect(lot.analyses).toEqual([])
  })
})
