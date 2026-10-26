import { FORMATS, LINES, bulkSku, formatOf, packedFormats, type ProductLine } from './formats'

// Il conto del magazzino, senza database: quello che c'è (sfuso e pezzi pronti, contati dai
// titolari) meno quello che serve agli ordini aperti. L'impegnato non si salva da nessuna parte,
// si ricalcola dagli ordini: così non può restare sfasato. Gli ordini prendono prima i pezzi già
// pronti del loro formato; quello che manca si confeziona dallo sfuso.

/** Quantità fisiche per SKU: per lo sfuso millilitri o grammi, per i formati pezzi. */
export type Counts = Record<string, number>
/** Righe d'ordine: per lo sfuso litri o chili, per i formati pezzi. */
export type Line = { sku: string; quantity: number }

export type FormatStock = {
  sku: string
  /** Pezzi pronti in magazzino. */
  ready: number
  /** Pezzi negli ordini aperti. */
  ordered: number
  /** Pezzi da confezionare dallo sfuso per gli ordini aperti. */
  toPack: number
  /** Pezzi che si possono ancora vendere: pronti liberi più quelli che lo sfuso libero permette. */
  available: number
}

export type LineStock = {
  line: ProductLine
  /** Sfuso in magazzino (ml o g). */
  bulk: number
  /** Sfuso chiesto dagli ordini "da imbottigliare" (ml o g). */
  bulkOrdered: number
  /** Sfuso non ancora destinato a nessun ordine (ml o g); negativo se gli ordini chiedono più di quanto c'è. */
  freeBulk: number
  /** Tutto il prodotto in magazzino, sfuso e confezionato (ml o g). */
  total: number
  /** Prodotto non destinato a ordini (ml o g). */
  free: number
  /** Litri o chili interi ancora ordinabili come "da imbottigliare". */
  bulkAvailable: number
  formats: FormatStock[]
}

const sumBy = (lines: Line[], sku: string) => lines.filter((line) => line.sku === sku).reduce((sum, line) => sum + line.quantity, 0)

export function lineStock(line: ProductLine, counts: Counts, open: Line[]): LineStock {
  const bulkFormat = formatOf(bulkSku(line))!
  const bulk = counts[bulkFormat.sku] ?? 0
  const bulkOrdered = sumBy(open, bulkFormat.sku) * bulkFormat.size

  const packing = packedFormats(line).map((format) => {
    const ready = counts[format.sku] ?? 0
    const ordered = sumBy(open, format.sku)
    const toPack = Math.max(0, ordered - ready)
    return { format, ready, ordered, toPack, freeReady: Math.max(0, ready - ordered) }
  })
  const freeBulk = bulk - bulkOrdered - packing.reduce((sum, row) => sum + row.toPack * row.format.size, 0)
  const spare = Math.max(0, freeBulk)

  return {
    line,
    bulk,
    bulkOrdered,
    freeBulk,
    total: bulk + packing.reduce((sum, row) => sum + row.ready * row.format.size, 0),
    free: freeBulk + packing.reduce((sum, row) => sum + row.freeReady * row.format.size, 0),
    bulkAvailable: Math.floor(spare / bulkFormat.size),
    formats: packing.map((row) => ({
      sku: row.format.sku,
      ready: row.ready,
      ordered: row.ordered,
      toPack: row.toPack,
      available: row.freeReady + Math.floor(spare / row.format.size),
    })),
  }
}

export function stockOverview(counts: Counts, open: Line[]): LineStock[] {
  return LINES.map((line) => lineStock(line, counts, open))
}

/** Pezzi (o litri e chili, per lo sfuso) ancora ordinabili per ogni SKU. */
export function availabilityBySku(counts: Counts, open: Line[]): Record<string, number> {
  return Object.fromEntries(
    stockOverview(counts, open).flatMap((stock) => [
      [bulkSku(stock.line), stock.bulkAvailable] as const,
      ...stock.formats.map((format) => [format.sku, format.available] as const),
    ]),
  )
}

export type Shortfall = { sku: string; requested: number; available: number }

/**
 * Cosa manca per accettare un ordine nuovo (o modificato: `open` sono gli altri ordini). Lo sfuso è
 * condiviso tra i formati della linea, quindi si controlla l'ordine intero: le righe prendono i
 * pezzi pronti liberi, il resto deve stare nello sfuso libero. Vuoto = si può fare.
 */
export function shortfalls(counts: Counts, open: Line[], request: Line[]): Shortfall[] {
  const tracked = request.filter((line) => formatOf(line.sku) && line.quantity > 0)
  return LINES.flatMap((line) => {
    const stock = lineStock(line, counts, open)
    const requested = tracked.filter((entry) => formatOf(entry.sku)!.line === line)
    const needFromBulk = requested.reduce((sum, entry) => {
      const format = formatOf(entry.sku)!
      const freeReady = format.bulk ? 0 : Math.max(0, (counts[format.sku] ?? 0) - (stock.formats.find((row) => row.sku === format.sku)?.ordered ?? 0))
      return sum + Math.max(0, entry.quantity - freeReady) * format.size
    }, 0)
    if (needFromBulk <= Math.max(0, stock.freeBulk)) return []
    const available = availabilityBySku(counts, open)
    const skus = [...new Set(requested.map((entry) => entry.sku))]
    return skus.map((sku) => ({ sku, requested: sumBy(requested, sku), available: available[sku] ?? 0 }))
  })
}

export type Movement = { sku: string; delta: number }

/**
 * Cosa esce dal magazzino alla consegna di un ordine: per ogni formato prima i pezzi pronti, poi lo
 * sfuso per quelli confezionati al momento; le righe "da imbottigliare" escono dallo sfuso.
 * Restituisce le variazioni per SKU (negative), da salvare per poterle annullare.
 */
export function deliveryMovements(counts: Counts, lines: Line[]): Movement[] {
  const remaining: Counts = { ...counts }
  const deltas = new Map<string, number>()
  const take = (sku: string, amount: number) => {
    if (amount === 0) return
    remaining[sku] = (remaining[sku] ?? 0) - amount
    deltas.set(sku, (deltas.get(sku) ?? 0) - amount)
  }
  for (const entry of lines) {
    const format = formatOf(entry.sku)
    if (!format || entry.quantity <= 0) continue
    const bulk = bulkSku(format.line)
    if (format.bulk) {
      take(bulk, entry.quantity * format.size)
      continue
    }
    const fromReady = Math.min(Math.max(0, remaining[format.sku] ?? 0), entry.quantity)
    take(format.sku, fromReady)
    take(bulk, (entry.quantity - fromReady) * format.size)
  }
  return FORMATS.flatMap((format) => (deltas.has(format.sku) ? [{ sku: format.sku, delta: deltas.get(format.sku)! }] : []))
}

/** Confezionare `pieces` pezzi: lo sfuso scende, i pezzi pronti salgono. */
export function packMovements(sku: string, pieces: number): Movement[] {
  const format = formatOf(sku)
  if (!format || format.bulk || pieces <= 0) return []
  return [
    { sku: bulkSku(format.line), delta: -pieces * format.size },
    { sku, delta: pieces },
  ]
}
