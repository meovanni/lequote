import { planConsolidation } from '../stock-pool-rules'

describe('planConsolidation', () => {
  it('porta nel magazzino principale la merce libera delle altre sedi, lasciando lì la riservata', () => {
    const plan = planConsolidation(
      [
        { location_id: 'roseto', stocked_quantity: 50, reserved_quantity: 10 },
        { location_id: 'cerchio', stocked_quantity: 30, reserved_quantity: 4 },
      ],
      'roseto',
    )
    expect(plan).toEqual({
      moved: 26,
      createMain: false,
      updates: [
        { location_id: 'cerchio', stocked_quantity: 4 },
        { location_id: 'roseto', stocked_quantity: 76 },
      ],
    })
  })

  it('crea il livello del magazzino principale se manca', () => {
    expect(planConsolidation([{ location_id: 'cerchio', stocked_quantity: 12, reserved_quantity: 0 }], 'roseto')).toEqual({
      moved: 12,
      createMain: true,
      updates: [
        { location_id: 'cerchio', stocked_quantity: 0 },
        { location_id: 'roseto', stocked_quantity: 12 },
      ],
    })
  })

  it('non fa nulla se le altre sedi non hanno merce libera', () => {
    expect(
      planConsolidation(
        [
          { location_id: 'roseto', stocked_quantity: 100, reserved_quantity: 0 },
          { location_id: 'cerchio', stocked_quantity: 3, reserved_quantity: 3 },
        ],
        'roseto',
      ),
    ).toEqual({ moved: 0, createMain: false, updates: [] })
  })
})
