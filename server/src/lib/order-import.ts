// Ordini importati da un foglio Excel (back office › Ordini › Importa da Excel). Colonne: Nome
// (nome e cognome, o solo nome), L (litri), Taniche (facoltativa: se manca, litri diviso la misura
// della tanica, per eccesso), Importo (facoltativo: se manca, prezzo di listino per taniche).
// Modulo senza dipendenze: lo usano l'anteprima nel browser e la rotta che crea gli ordini.

export type ImportColumns = { name: number; liters: number | null; tanks: number | null; amount: number | null }

export type ImportRow = {
  /** Riga del foglio, contando da 1 come in Excel. */
  line: number
  name: string
  first_name: string | null
  last_name: string | null
  liters: number | null
  tanks: number
  /** Totale dell'ordine, IVA inclusa. */
  amount: number
  /** true se l'importo viene dal file (prezzo forzato), false se dal listino. */
  amountFromFile: boolean
  unitPrice: number
  warnings: string[]
  error?: string
}

export type ImportPlan = { rows: ImportRow[]; error?: string }

export type ImportOptions = {
  /** Litri per tanica: 5 di default. */
  litersPerTank: number
  /** Prezzo di listino della tanica, IVA inclusa; null se non impostato. */
  unitPrice: number | null
}

const round2 = (value: number) => Math.round(value * 100) / 100

const euro = (value: number) => `${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`

const isBlank = (value: unknown) => value === null || value === undefined || String(value).trim() === ''

/** Numero da una cella: "10", "10,5", "€ 1.234,50", "20 L". Null se vuota o illeggibile. */
export function parseNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (isBlank(value)) return null
  let text = String(value).replace(/[^\d.,-]/g, '')
  if (!/\d/.test(text)) return null
  const lastComma = text.lastIndexOf(',')
  const lastDot = text.lastIndexOf('.')
  if (lastComma >= 0 && lastDot >= 0) {
    // Il separatore che viene per ultimo è quello dei decimali.
    text = lastComma > lastDot ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '')
  } else if (lastComma >= 0) {
    text = text.replace(',', '.')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(text)) {
    text = text.replace(/\./g, '')
  }
  const number = Number(text)
  return Number.isFinite(number) ? number : null
}

/** "Anna Di Marco" → nome Anna, cognome Di Marco; una parola sola è il nome. */
export function splitName(full: string): { first_name: string; last_name: string | null } {
  const [first, ...rest] = full.trim().split(/\s+/)
  return { first_name: first, last_name: rest.length > 0 ? rest.join(' ') : null }
}

const HEADERS: Record<keyof ImportColumns, RegExp> = {
  name: /^(nome|cliente|nominativo)/,
  liters: /^(l|lt|litri|litro)\b/,
  tanks: /^(tanic|latt)/,
  amount: /^(importo|totale|prezzo|euro|€)/,
}

/** Posizione delle colonne nell'intestazione; errore se manca il nome o mancano sia litri sia taniche. */
export function findColumns(header: unknown[]): ImportColumns | { error: string } {
  const labels = header.map((cell) => String(cell ?? '').trim().toLowerCase())
  const find = (key: keyof ImportColumns) => {
    const index = labels.findIndex((label) => HEADERS[key].test(label))
    return index < 0 ? null : index
  }
  const name = find('name')
  if (name === null) return { error: 'Manca la colonna Nome.' }
  const columns = { name, liters: find('liters'), tanks: find('tanks'), amount: find('amount') }
  if (columns.liters === null && columns.tanks === null) return { error: 'Manca la colonna L (litri) o Taniche.' }
  return columns
}

/** Prezzo della singola tanica per arrivare all'importo, al centesimo. */
export function unitPriceFor(amount: number, tanks: number): number {
  return round2(amount / tanks)
}

const cell = (row: unknown[], index: number | null) => (index === null ? null : row[index])

function planRow(row: unknown[], line: number, columns: ImportColumns, options: ImportOptions): ImportRow {
  const name = String(cell(row, columns.name) ?? '').trim()
  const liters = parseNumber(cell(row, columns.liters))
  const fileTanks = parseNumber(cell(row, columns.tanks))
  const fileAmount = parseNumber(cell(row, columns.amount))
  const base = { line, name, ...(name ? splitName(name) : { first_name: null, last_name: null }), liters }
  const empty = { tanks: 0, amount: 0, amountFromFile: false, unitPrice: 0, warnings: [] }

  if (!name) return { ...base, ...empty, error: 'Manca il nome.' }
  const tanks = fileTanks !== null ? Math.round(fileTanks) : liters !== null ? Math.ceil(liters / options.litersPerTank) : null
  if (tanks === null || tanks <= 0) return { ...base, ...empty, error: 'Mancano litri o taniche.' }

  const warnings: string[] = []
  if (fileTanks === null && liters !== null && liters % options.litersPerTank !== 0) {
    warnings.push(`${liters} L non sono taniche intere: ${tanks} taniche (${tanks * options.litersPerTank} L).`)
  }
  if (fileTanks !== null && liters !== null && liters !== tanks * options.litersPerTank) {
    warnings.push(`${liters} L con ${tanks} taniche da ${options.litersPerTank} L (${tanks * options.litersPerTank} L): conta il numero di taniche.`)
  }

  if (fileAmount !== null) {
    const unitPrice = unitPriceFor(fileAmount, tanks)
    const amount = round2(unitPrice * tanks)
    if (amount !== round2(fileAmount)) {
      warnings.push(`${euro(fileAmount)} non si divide per ${tanks} taniche: ${tanks} × ${euro(unitPrice)} = ${euro(amount)}.`)
    }
    return { ...base, tanks, amount, amountFromFile: true, unitPrice, warnings }
  }
  if (options.unitPrice === null) {
    return { ...base, ...empty, tanks, warnings, error: 'Manca l’importo e la tanica non ha un prezzo di listino.' }
  }
  return { ...base, tanks, amount: round2(options.unitPrice * tanks), amountFromFile: false, unitPrice: options.unitPrice, warnings }
}

/** Dal foglio (righe di celle, intestazione compresa) alle righe da importare, con avvisi ed errori. */
export function planImport(sheet: unknown[][], options: ImportOptions): ImportPlan {
  const headerIndex = sheet.findIndex((row) => row.some((value) => !isBlank(value)))
  if (headerIndex < 0) return { rows: [], error: 'Il foglio è vuoto.' }
  const columns = findColumns(sheet[headerIndex])
  if ('error' in columns) return { rows: [], error: columns.error }

  const rows = sheet
    .map((row, index) => ({ row, line: index + 1 }))
    .slice(headerIndex + 1)
    .filter(({ row }) => row.some((value) => !isBlank(value)))
    .map(({ row, line }) => planRow(row, line, columns, options))
  return { rows }
}
