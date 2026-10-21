import { refundDeadline } from '../refund-deadline'

describe('refundDeadline', () => {
  const submitted = '2026-10-01T09:30:00Z'

  it('scade 14 giorni dopo l’invio', () => {
    const { due } = refundDeadline(submitted, new Date('2026-10-02T10:00:00Z'))
    expect(due.toISOString()).toBe('2026-10-15T09:30:00.000Z')
  })

  it('conta i giorni che restano e segnala gli ultimi tre', () => {
    expect(refundDeadline(submitted, new Date('2026-10-02T10:00:00Z'))).toEqual(expect.objectContaining({ daysLeft: 13, level: 'ok' }))
    expect(refundDeadline(submitted, new Date('2026-10-12T10:00:00Z'))).toEqual(expect.objectContaining({ daysLeft: 3, level: 'soon' }))
    expect(refundDeadline(submitted, new Date('2026-10-15T08:00:00Z'))).toEqual(expect.objectContaining({ daysLeft: 0, level: 'soon' }))
  })

  it('dopo la scadenza è in ritardo', () => {
    expect(refundDeadline(submitted, new Date('2026-10-17T10:00:00Z'))).toEqual(expect.objectContaining({ daysLeft: -2, level: 'late' }))
  })
})
