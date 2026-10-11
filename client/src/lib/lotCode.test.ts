import { describe, expect, it } from 'vitest'
import { parseLotCode } from './lotCode'

describe('parseLotCode', () => {
  it('accetta un codice già nel formato di etichetta', () => {
    expect(parseLotCode('L2026-01')).toEqual({ ok: true, code: 'L2026-01' })
  })

  it('normalizza maiuscole e spazi', () => {
    expect(parseLotCode('  l 2026-01 ')).toEqual({ ok: true, code: 'L2026-01' })
  })

  it('aggiunge la L iniziale se il visitatore la omette', () => {
    expect(parseLotCode('2026-01')).toEqual({ ok: true, code: 'L2026-01' })
  })

  it('accetta il punto come separatore', () => {
    expect(parseLotCode('L26.014')).toEqual({ ok: true, code: 'L26.014' })
  })

  it('rifiuta un campo vuoto', () => {
    expect(parseLotCode('   ')).toEqual({ ok: false, reason: 'empty' })
  })

  it('rifiuta caratteri non ammessi', () => {
    expect(parseLotCode('L2026/01')).toEqual({ ok: false, reason: 'format' })
    expect(parseLotCode('<script>')).toEqual({ ok: false, reason: 'format' })
  })

  it('rifiuta codici troppo corti o troppo lunghi', () => {
    expect(parseLotCode('L1')).toEqual({ ok: false, reason: 'format' })
    expect(parseLotCode(`L${'1'.repeat(25)}`)).toEqual({ ok: false, reason: 'format' })
  })

  it('rifiuta separatori in testa o in coda', () => {
    expect(parseLotCode('-2026')).toEqual({ ok: false, reason: 'format' })
    expect(parseLotCode('L2026-')).toEqual({ ok: false, reason: 'format' })
  })
})

describe('parseLotCode, separatori', () => {
  it('rifiuta separatori consecutivi', () => {
    expect(parseLotCode('L2026--01')).toEqual({ ok: false, reason: 'format' })
    expect(parseLotCode('L26.-01')).toEqual({ ok: false, reason: 'format' })
  })

  it('tollera un separatore subito dopo la L', () => {
    expect(parseLotCode('L-2026-01')).toEqual({ ok: true, code: 'L2026-01' })
    expect(parseLotCode('L.2026')).toEqual({ ok: true, code: 'L2026' })
  })
})
