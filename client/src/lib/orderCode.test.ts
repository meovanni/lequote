import { describe, expect, it } from 'vitest'
import { orderCode } from './orderCode'

// Gli stessi casi sono in server/src/lib/__tests__/order-code.unit.spec.ts: i due calcoli devono coincidere.
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
})
