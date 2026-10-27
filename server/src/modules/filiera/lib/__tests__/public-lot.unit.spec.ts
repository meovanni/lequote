import { toPublicLot, type LotRecord } from '../public-lot'

function lot(overrides: Partial<LotRecord> = {}): LotRecord {
  return {
    code: 'L2026-01',
    status: 'published',
    product_line: 'olio',
    product_name: 'Olio extravergine di oliva',
    nominal_quantity: '0,5 l',
    best_before: '2027-12-31',
    origin: 'Italia',
    packaging_date: '2026-01-20',
    campaign: {
      label: '2025/26',
      harvest_start: '2025-10-15',
      harvest_end: '2025-11-20',
      analyses: [
        { id: 'anl_pub', title: 'Analisi chimico-fisica', lab: 'Laboratorio Alfa', date: '2025-12-10', visibility: 'public' },
        { id: 'anl_int', title: 'Verbale interno', lab: 'Laboratorio Alfa', date: '2025-12-11', visibility: 'internal' },
      ],
    },
    packaging_establishment: {
      name: 'Frantoio Beta',
      municipality: 'Atri',
      province: 'TE',
    },
    stages: [
      {
        name: 'Molitura',
        position: 2,
        date: '2025-11-02',
        place: 'Frantoio Beta, Atri',
        fields: [
          { key: 'metodo', label: 'Metodo', visibility: 'public', value: 'Ciclo continuo a freddo' },
          { key: 'registro', label: 'Registro SIAN', visibility: 'internal', value: 'SIAN-123' },
          { key: 'temp', label: 'Temperatura di gramolatura', visibility: 'legal', value: '26 °C' },
        ],
      },
      {
        name: 'Raccolta',
        position: 1,
        date: '2025-10-20',
        place: 'Roseto degli Abruzzi',
        fields: [{ key: 'cultivar', label: 'Varietà', visibility: 'public', value: 'Leccino, Frantoio' }],
      },
    ],
    ...overrides,
  }
}

describe('toPublicLot', () => {
  it('non restituisce i lotti in bozza', () => {
    expect(toPublicLot(lot({ status: 'draft' }))).toBeNull()
  })

  it('ordina le fasi per posizione e mostra solo i campi pubblici nel percorso', () => {
    const result = toPublicLot(lot())!
    expect(result.stages.map((stage) => stage.name)).toEqual(['Raccolta', 'Molitura'])
    expect(result.stages[1].fields).toEqual([{ label: 'Metodo', value: 'Ciclo continuo a freddo' }])
  })

  it('sposta i campi di tipo legal nel pannello delle informazioni di legge', () => {
    const result = toPublicLot(lot())!
    expect(result.legal).toContainEqual({ label: 'Temperatura di gramolatura', value: '26 °C' })
  })

  it('non espone mai codici o allegati interni', () => {
    const serialised = JSON.stringify(toPublicLot(lot()))
    expect(serialised).not.toContain('SIAN-123')
    expect(serialised).not.toContain('Verbale interno')
    expect(serialised).not.toContain('anl_int')
  })

  it('riporta i dati obbligatori di etichetta nel pannello legale', () => {
    const result = toPublicLot(lot())!
    expect(result.legal).toEqual(
      expect.arrayContaining([
        { label: 'Lotto', value: 'L2026-01' },
        { label: 'Origine', value: 'Italia' },
        { label: 'Quantità nominale', value: '0,5 l' },
        { label: 'Da consumarsi preferibilmente entro', value: '2027-12-31' },
        { label: 'Confezionato da', value: 'Frantoio Beta, Atri (TE)' },
      ]),
    )
  })

  it('include solo le analisi pubbliche della campagna', () => {
    const result = toPublicLot(lot())!
    expect(result.analyses).toEqual([
      { title: 'Analisi chimico-fisica', lab: 'Laboratorio Alfa', date: '2025-12-10' },
    ])
  })

  it('omette i campi vuoti invece di mostrare valori mancanti', () => {
    const result = toPublicLot(lot({ best_before: null, packaging_establishment: null }))!
    const labels = result.legal.map((item) => item.label)
    expect(labels).not.toContain('Da consumarsi preferibilmente entro')
    expect(labels).not.toContain('Confezionato da')
  })
})
