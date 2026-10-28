import { publishBlockers, type PublishCandidate } from '../publish-check'

function candidate(overrides: Partial<PublishCandidate> = {}): PublishCandidate {
  return {
    code: 'L2026-01',
    product_name: 'Olio extravergine di oliva',
    origin: 'Italia',
    packages: [{ size: 0.75, count: null }],
    best_before: new Date('2027-12-31'),
    campaign_id: 'cmp_1',
    packaging_establishment_id: 'est_1',
    stages: [{ name: 'Raccolta', fields: [{ label: 'Varietà', required: true, value: 'Leccino' }] }],
    ...overrides,
  }
}

describe('publishBlockers', () => {
  it('non blocca un lotto completo', () => {
    expect(publishBlockers(candidate())).toEqual([])
  })

  it('elenca ogni dato obbligatorio di etichetta mancante', () => {
    const blockers = publishBlockers(
      candidate({ packages: [], best_before: null, packaging_establishment_id: null, origin: '' }),
    )
    expect(blockers).toEqual([
      'Origine',
      'Confezioni del lotto (quantità nominale)',
      'Termine minimo di conservazione',
      'Stabilimento di confezionamento',
    ])
  })

  it('rifiuta un codice lotto non valido', () => {
    expect(publishBlockers(candidate({ code: 'L20/26' }))).toContain('Codice lotto valido')
  })

  it('richiede i campi obbligatori delle fasi', () => {
    const blockers = publishBlockers(
      candidate({ stages: [{ name: 'Raccolta', fields: [{ label: 'Varietà', required: true, value: null }] }] }),
    )
    expect(blockers).toEqual(['Raccolta: Varietà'])
  })

  it('richiede almeno una fase di filiera', () => {
    expect(publishBlockers(candidate({ stages: [] }))).toEqual(['Almeno una fase di filiera'])
  })
})
