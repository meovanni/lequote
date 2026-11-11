import { csvCell } from '../documenti'

describe('CSV per il commercialista', () => {
  it('un testo che comincia come una formula resta testo', () => {
    expect(csvCell('=HYPERLINK("http://example.invalid";"x")')).toBe('"\'=HYPERLINK(""http://example.invalid"";""x"")"')
    expect(csvCell('+39 333')).toBe("'+39 333")
    expect(csvCell('-1')).toBe("'-1")
    expect(csvCell('@SOMMA(A1)')).toBe("'@SOMMA(A1)")
  })

  it('i testi normali e gli importi restano come sono', () => {
    expect(csvCell('Bottega Rossi srl')).toBe('Bottega Rossi srl')
    expect(csvCell('Via Roma 1; Teramo')).toBe('"Via Roma 1; Teramo"')
    expect(csvCell(-12.5)).toBe('-12,50')
    expect(csvCell(23.08)).toBe('23,08')
  })
})
