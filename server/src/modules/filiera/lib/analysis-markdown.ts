// Dal referto PDF al testo in markdown: le parole si raggruppano per riga (stessa altezza sulla
// pagina) e, dove c'è uno spazio largo tra due parole, si apre una nuova colonna. Le righe con più
// colonne diventano righe di tabella, così "Acidità | 0,21 | ≤ 0,8" resta leggibile e
// analysis-values.ts ritrova il valore. Un referto scansionato (solo immagine) non ha testo: in
// quel caso i valori si inseriscono a mano nel back office.

export type TextItem = { str: string; x: number; y: number; width: number; fontSize: number }

/** Spazio orizzontale, in multipli della dimensione del carattere, che separa due colonne. */
const COLUMN_GAP = 1.5

function lineCells(items: TextItem[]): string[] {
  const sorted = [...items].sort((a, b) => a.x - b.x)
  const cells: string[] = []
  let previousEnd: number | null = null
  for (const item of sorted) {
    const text = item.str.trim()
    if (!text) continue
    const gap = previousEnd === null ? 0 : item.x - previousEnd
    if (previousEnd === null || gap > COLUMN_GAP * Math.max(item.fontSize, 1)) cells.push(text)
    else cells[cells.length - 1] += `${gap > 0.15 * item.fontSize ? ' ' : ''}${text}`
    previousEnd = item.x + item.width
  }
  return cells
}

/** Righe della pagina dall'alto in basso; due parole sono sulla stessa riga se l'altezza differisce poco. */
function pageLines(items: TextItem[]): string[][] {
  const rows: { y: number; items: TextItem[] }[] = []
  for (const item of [...items].sort((a, b) => b.y - a.y)) {
    const tolerance = Math.max(item.fontSize, 1) * 0.5
    const row = rows.find((candidate) => Math.abs(candidate.y - item.y) <= tolerance)
    if (row) row.items.push(item)
    else rows.push({ y: item.y, items: [item] })
  }
  return rows.map((row) => lineCells(row.items)).filter((cells) => cells.length > 0)
}

const escapeCell = (cell: string) => cell.replace(/\|/g, '/')

export function itemsToMarkdown(pages: TextItem[][]): string {
  const blocks = pages.map((items, index) => {
    const lines = pageLines(items).map((cells) =>
      cells.length > 1 ? `| ${cells.map(escapeCell).join(' | ')} |` : cells[0],
    )
    return pages.length > 1 ? [`## Pagina ${index + 1}`, '', ...lines].join('\n') : lines.join('\n')
  })
  return blocks.join('\n\n').trim()
}

/** Il testo di un PDF in markdown; stringa vuota se il PDF non contiene testo o non si legge. */
export async function pdfToMarkdown(data: Buffer): Promise<string> {
  try {
    const { extractTextItems } = await import('unpdf')
    const { items } = await extractTextItems(new Uint8Array(data))
    return itemsToMarkdown(items)
  } catch {
    return ''
  }
}
