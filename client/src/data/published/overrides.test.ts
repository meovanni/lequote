import { describe, expect, it } from 'vitest'
import { applyOverrides, flattenStrings, replaceEverywhere, withinPrefix } from './overrides'

const base = {
  title: 'Titolo',
  count: (n: number) => `${n} articoli`,
  amount: 3,
  steps: [{ id: 'a', title: 'Raccolta' }, { id: 'b', title: 'Molitura' }],
  empty: null,
}

describe('flattenStrings', () => {
  it('elenca i testi per percorso, senza funzioni, numeri e valori vuoti', () => {
    expect(flattenStrings(base)).toEqual({
      title: 'Titolo',
      'steps.0.id': 'a',
      'steps.0.title': 'Raccolta',
      'steps.1.id': 'b',
      'steps.1.title': 'Molitura',
    })
  })
})

describe('applyOverrides', () => {
  it('cambia solo i testi indicati e lascia intatto l’originale', () => {
    const result = applyOverrides(base, { title: 'Nuovo', 'steps.1.title': 'Frangitura' })
    expect(result.title).toBe('Nuovo')
    expect(result.steps[1].title).toBe('Frangitura')
    expect(result.steps[0]).toEqual(base.steps[0])
    expect(base.title).toBe('Titolo')
    expect(base.steps[1].title).toBe('Molitura')
  })

  it('ignora chiavi sconosciute e non tocca funzioni, numeri ed elenchi', () => {
    const result = applyOverrides(base, { missing: 'x', count: 'x', amount: 'x', steps: 'x', 'steps.5.title': 'x' })
    expect(result.count(2)).toBe('2 articoli')
    expect(result.amount).toBe(3)
    expect(result.steps).toHaveLength(2)
    expect(result).not.toHaveProperty('missing')
  })

  it('senza modifiche restituisce lo stesso oggetto', () => {
    expect(applyOverrides(base, {})).toBe(base)
  })
})

describe('replaceEverywhere', () => {
  it('sostituisce un dato in ogni testo che lo contiene', () => {
    const result = replaceEverywhere({ a: 'P.IVA [da fornire].', b: ['Scrivi a [da fornire]'] }, [['[da fornire]', '01234567890']])
    expect(result).toEqual({ a: 'P.IVA 01234567890.', b: ['Scrivi a 01234567890'] })
  })

  it('ignora le coppie vuote o uguali', () => {
    const source = { a: 'testo' }
    expect(replaceEverywhere(source, [['', 'x'], ['testo', 'testo']])).toBe(source)
  })
})

describe('withinPrefix', () => {
  it('tiene le chiavi del gruppo, senza prefisso', () => {
    expect(withinPrefix({ 'legal.ui.tocLabel': 'Indice', 'hero.title': 'x', legalese: 'y' }, 'legal')).toEqual({ 'ui.tocLabel': 'Indice' })
  })
})
