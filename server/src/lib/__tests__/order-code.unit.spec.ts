import { orderCode, parseOrderCode } from '../order-code'

// Gli stessi casi sono in client/src/lib/orderCode.test.ts: i due calcoli devono coincidere.
const CASES: [number, string, string][] = [
  [1, '2026-10-27T10:00:00Z', 'BBTHK26'],
  [2, '2026-10-27T10:00:00Z', 'KB6CD26'],
  [3, '2026-10-27T10:00:00Z', 'UAH7726'],
  [1000, '2026-10-27T10:00:00Z', 'FCW6826'],
  [7, '2026-12-31T23:30:00Z', 'V7WHE27'],
]

describe('codice ordine', () => {
  it.each(CASES)('ordine %i del %s diventa %s', (displayId, createdAt, code) => {
    expect(orderCode(displayId, createdAt)).toBe(code)
  })

  it('ha 7 caratteri, gli ultimi due sono l’anno, senza caratteri che si confondono', () => {
    for (let id = 1; id <= 2000; id++) {
      const code = orderCode(id, '2026-03-01T12:00:00Z')
      expect(code).toMatch(/^[2-9A-HJKMNP-Z]{5}26$/)
    }
  })

  it('dà codici diversi a ordini diversi', () => {
    const codes = new Set(Array.from({ length: 5000 }, (_, i) => orderCode(i + 1, '2026-03-01T12:00:00Z')))
    expect(codes.size).toBe(5000)
  })

  it('dal codice risale al progressivo, comunque lo scriva il cliente', () => {
    expect(parseOrderCode('BBTHK26')).toEqual({ displayId: 1, year: '26', code: 'BBTHK26' })
    expect(parseOrderCode(' #bbthk-26 ')).toEqual({ displayId: 1, year: '26', code: 'BBTHK26' })
    expect(parseOrderCode('n. bbthk26')?.code).toBe('BBTHK26')
    expect(parseOrderCode('BBTHK 26')?.code).toBe('BBTHK26')
    for (let id = 1; id <= 500; id++) expect(parseOrderCode(orderCode(id, '2026-05-05'))?.displayId).toBe(id)
  })

  it('rifiuta ciò che non è un codice', () => {
    expect(parseOrderCode('12')).toBeNull()
    expect(parseOrderCode('BBTHK2')).toBeNull()
    expect(parseOrderCode('BBTHO26')).toBeNull()
    expect(parseOrderCode('il miele di settembre')).toBeNull()
    expect(parseOrderCode('BBTHK26 e KB6CD26')).toBeNull()
  })
})
