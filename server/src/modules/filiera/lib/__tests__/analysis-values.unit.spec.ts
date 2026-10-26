import { analysisResultsFrom, detectNutritionBasis, parseAnalysisValues } from '../analysis-values'
import { itemsToMarkdown, pdfToMarkdown, type TextItem } from '../analysis-markdown'

const valueOf = (markdown: string, key: string) => parseAnalysisValues(markdown).find((value) => value.key === key)?.value

const OIL_REPORT = `
# Rapporto di prova n. 1234/25
| Parametro | Metodo | Risultato | Limiti EVO |
| --- | --- | --- | --- |
| Acidità libera (% acido oleico) | Reg. CEE 2568/91 All. II | 0,21 | ≤ 0,80 |
| Numero di perossidi (meq O2/kg) | Reg. CEE 2568/91 All. III | 6,5 | ≤ 20 |
| K232 | Reg. CEE 2568/91 All. IX | 1,85 | ≤ 2,50 |
| K270 | Reg. CEE 2568/91 All. IX | 0,14 | ≤ 0,22 |
| Delta K | | 0,002 | ≤ 0,01 |
| Esteri etilici degli acidi grassi (mg/kg) | Reg. UE 2022/2105 | < 10 | ≤ 35 |
| Polifenoli totali (mg/kg) | COI/T.20/Doc. 29 | 412 | |
Valori nutrizionali medi per 100 g
| Energia | 3389 kJ / 824 kcal |
| Grassi | 91,6 g |
| di cui acidi grassi saturi | 14,2 g |
| di cui acidi grassi monoinsaturi | 70,1 g |
| di cui acidi grassi polinsaturi | 7,3 g |
| Carboidrati | 0 g |
| di cui zuccheri | 0 g |
| Proteine | 0 g |
| Sale | 0 g |
Valutazione organolettica (panel test)
| Mediana del difetto (Md) | 0 |
| Mediana del fruttato (Mf) | 5,2 |
| Amaro | 4,1 |
| Piccante | 4,6 |
Descrittori: erba fresca, carciofo, pomodoro verde
`

describe('parseAnalysisValues', () => {
  it('legge i parametri chimici saltando metodi, unità e limiti', () => {
    expect(valueOf(OIL_REPORT, 'acidita')).toBe('0.21')
    expect(valueOf(OIL_REPORT, 'perossidi')).toBe('6.5')
    expect(valueOf(OIL_REPORT, 'k232')).toBe('1.85')
    expect(valueOf(OIL_REPORT, 'k270')).toBe('0.14')
    expect(valueOf(OIL_REPORT, 'delta_k')).toBe('0.002')
    expect(valueOf(OIL_REPORT, 'etil_esteri')).toBe('< 10')
    expect(valueOf(OIL_REPORT, 'polifenoli')).toBe('412')
  })

  it('legge la dichiarazione nutrizionale, kJ e kcal dalla stessa riga', () => {
    expect(valueOf(OIL_REPORT, 'energia_kj')).toBe('3389')
    expect(valueOf(OIL_REPORT, 'energia_kcal')).toBe('824')
    expect(valueOf(OIL_REPORT, 'grassi')).toBe('91.6')
    expect(valueOf(OIL_REPORT, 'saturi')).toBe('14.2')
    expect(valueOf(OIL_REPORT, 'monoinsaturi')).toBe('70.1')
    expect(valueOf(OIL_REPORT, 'polinsaturi')).toBe('7.3')
    expect(valueOf(OIL_REPORT, 'carboidrati')).toBe('0')
    expect(valueOf(OIL_REPORT, 'zuccheri')).toBe('0')
    expect(valueOf(OIL_REPORT, 'proteine')).toBe('0')
    expect(valueOf(OIL_REPORT, 'sale')).toBe('0')
  })

  it('legge il panel test e le note sensoriali', () => {
    expect(valueOf(OIL_REPORT, 'difetti')).toBe('0')
    expect(valueOf(OIL_REPORT, 'fruttato')).toBe('5.2')
    expect(valueOf(OIL_REPORT, 'amaro')).toBe('4.1')
    expect(valueOf(OIL_REPORT, 'piccante')).toBe('4.6')
    expect(valueOf(OIL_REPORT, 'descrittori')).toBe('erba fresca, carciofo, pomodoro verde')
  })

  it('accetta etichetta e valore nella stessa cella', () => {
    expect(valueOf('Acidità libera 0,32 %', 'acidita')).toBe('0.32')
    expect(valueOf('Energia (kJ) 3389\nEnergia (kcal) 824', 'energia_kcal')).toBe('824')
  })

  it('legge le analisi del miele', () => {
    const honey = '| Umidità | 17,2 % |\n| HMF | 4,1 mg/kg |\n| Origine botanica | Millefiori di montagna |'
    expect(valueOf(honey, 'umidita')).toBe('17.2')
    expect(valueOf(honey, 'hmf')).toBe('4.1')
    expect(valueOf(honey, 'origine_botanica')).toBe('Millefiori di montagna')
  })

  it('non inventa valori dove il referto non ne ha', () => {
    expect(parseAnalysisValues('Laboratorio Analisi Srl\nVia Roma 1')).toEqual([])
  })
})

describe('analysisResultsFrom', () => {
  it('tiene il testo, i valori e la base della dichiarazione nutrizionale', () => {
    const results = analysisResultsFrom(OIL_REPORT)
    expect(results.markdown).toBe(OIL_REPORT)
    expect(results.nutrition_basis).toBe('100 g')
    expect(results.values[0]).toEqual({ key: 'acidita', label: 'Acidità libera', group: 'chimica', value: '0.21', unit: '% acido oleico' })
    expect(detectNutritionBasis('Valori medi per 100 ml')).toBe('100 ml')
  })
})

describe('itemsToMarkdown', () => {
  const item = (str: string, x: number, y: number): TextItem => ({ str, x, y, width: str.length * 5, fontSize: 10 })

  it('ricompone righe e colonne di una tabella', () => {
    const page = [
      item('0,21', 300, 700),
      item('Acidità', 50, 700),
      item('libera', 90, 700),
      item('Perossidi', 50, 680),
      item('6,5', 300, 681),
    ]
    expect(itemsToMarkdown([page])).toBe('| Acidità libera | 0,21 |\n| Perossidi | 6,5 |')
  })

  it('separa le pagine con un titolo', () => {
    expect(itemsToMarkdown([[item('Uno', 0, 10)], [item('Due', 0, 10)]])).toBe('## Pagina 1\n\nUno\n\n## Pagina 2\n\nDue')
  })
})

describe('pdfToMarkdown', () => {
  /** Un PDF minimo con una riga di tabella: etichetta a sinistra, risultato in un'altra colonna. */
  function tinyPdf(): Buffer {
    const stream = 'BT /F1 10 Tf 50 700 Td (Acidita libera) Tj 250 0 Td (0,21) Tj ET'
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    ]
    let body = '%PDF-1.4\n'
    const offsets = objects.map((object, index) => {
      const offset = body.length
      body += `${index + 1} 0 obj\n${object}\nendobj\n`
      return offset
    })
    const xref = body.length
    body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
    body += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
    body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
    return Buffer.from(body, 'latin1')
  }

  it('estrae il testo del referto come righe di tabella', async () => {
    expect(await pdfToMarkdown(tinyPdf())).toBe('| Acidita libera | 0,21 |')
  })

  it('restituisce testo vuoto se il file non si legge', async () => {
    expect(await pdfToMarkdown(Buffer.from('%PDF-rotto'))).toBe('')
  })
})
