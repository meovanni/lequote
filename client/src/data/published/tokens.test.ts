import { describe, expect, it } from 'vitest'
import { detokenize, tokenPairs, tokenize } from './tokens'

describe('segnaposto dei dati aziendali', () => {
  const pairs = tokenPairs({
    'SELLER.vat': ['[P.IVA da fornire]', '02173860673'],
    'SELLER.email': ['info@le-quote.it', 'info@le-quote.it'],
    'SELLER.phone': ['7', undefined],
  })

  it('riconosce il valore di partenza e quello attuale, una volta sola, senza i valori troppo corti', () => {
    expect(pairs).toEqual([
      ['[P.IVA da fornire]', '{partita iva}'],
      ['info@le-quote.it', '{email}'],
      ['02173860673', '{partita iva}'],
    ])
  })

  it('scritti per esteso diventano segnaposto', () => {
    expect(tokenize({ a: 'P.IVA 02173860673, info@le-quote.it', b: ['P.IVA [P.IVA da fornire]'] }, pairs)).toEqual({
      a: 'P.IVA {partita iva}, {email}',
      b: ['P.IVA {partita iva}'],
    })
  })

  it('i segnaposto prendono il valore attuale', () => {
    expect(detokenize('P.IVA {partita iva}', { 'SELLER.vat': '01234567890' })).toBe('P.IVA 01234567890')
  })

  it('un dato vuoto sparisce dagli elenchi insieme alla sua etichetta', () => {
    const current = { 'SELLER.pec': 'lequote@pec.it', 'SELLER.phone': '' }
    expect(detokenize('Contatti: PEC {pec}, telefono {telefono}.', current)).toBe('Contatti: PEC lequote@pec.it.')
    expect(detokenize('Kontakt: (PEC) {pec}, Telefon {telefono}.', current)).toBe('Kontakt: (PEC) lequote@pec.it.')
    expect(detokenize('{telefono}', current)).toBe('')
  })
})
