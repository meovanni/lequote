import { buildLotStages, type TemplateForBuild } from '../stage-builder'

const raccolta: TemplateForBuild = {
  id: 'stt_raccolta',
  product_line: 'olio',
  name: 'Raccolta',
  position: 1,
  fields: [
    { key: 'varieta', label: 'Varietà', type: 'text', visibility: 'public', required: true },
    { key: 'registro', label: 'Registro', type: 'text', visibility: 'internal', required: false },
  ],
}

describe('buildLotStages', () => {
  it('prende nome, posizione, etichette e visibilità dal modello, i valori dal back office', () => {
    const result = buildLotStages('olio', [raccolta], [
      { template_id: 'stt_raccolta', date: null, place: 'Roseto', values: { varieta: 'Leccino', registro: 'R-1' } },
    ])
    expect(result).toEqual({
      ok: true,
      stages: [
        {
          template_id: 'stt_raccolta',
          name: 'Raccolta',
          position: 1,
          date: null,
          place: 'Roseto',
          fields: [
            { key: 'varieta', label: 'Varietà', visibility: 'public', required: true, value: 'Leccino' },
            { key: 'registro', label: 'Registro', visibility: 'internal', required: false, value: 'R-1' },
          ],
        },
      ],
    })
  })

  it('lascia vuoti i campi non compilati', () => {
    const result = buildLotStages('olio', [raccolta], [{ template_id: 'stt_raccolta', date: null, place: null, values: {} }])
    expect(result.ok && result.stages[0].fields.map((field) => field.value)).toEqual([null, null])
  })

  it('rifiuta un modello sconosciuto o di un\'altra linea', () => {
    expect(buildLotStages('olio', [raccolta], [{ template_id: 'stt_altro', date: null, place: null, values: {} }])).toEqual({
      ok: false,
      error: 'Modello di fase sconosciuto: stt_altro.',
    })
    expect(buildLotStages('miele', [raccolta], [{ template_id: 'stt_raccolta', date: null, place: null, values: {} }]).ok).toBe(false)
  })

  it('rifiuta campi che il modello non prevede', () => {
    const result = buildLotStages('olio', [raccolta], [
      { template_id: 'stt_raccolta', date: null, place: null, values: { inventato: 'x' } },
    ])
    expect(result).toEqual({ ok: false, error: 'La fase Raccolta non prevede il campo «inventato».' })
  })

  it('rifiuta la stessa fase ripetuta', () => {
    const stage = { template_id: 'stt_raccolta', date: null, place: null, values: {} }
    expect(buildLotStages('olio', [raccolta], [stage, stage])).toEqual({ ok: false, error: 'La fase Raccolta è ripetuta.' })
  })

  it('ordina le fasi secondo i modelli', () => {
    const molitura: TemplateForBuild = { ...raccolta, id: 'stt_molitura', name: 'Molitura', position: 2, fields: [] }
    const result = buildLotStages('olio', [raccolta, molitura], [
      { template_id: 'stt_molitura', date: null, place: null, values: {} },
      { template_id: 'stt_raccolta', date: null, place: null, values: {} },
    ])
    expect(result.ok && result.stages.map((stage) => stage.name)).toEqual(['Raccolta', 'Molitura'])
  })
})
