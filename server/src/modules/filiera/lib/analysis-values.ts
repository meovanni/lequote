// Valori di un referto di analisi: il testo del referto (markdown, estratto dal PDF in
// analysis-markdown.ts) e i valori letti da quel testo. La lettura è una proposta: nel back office
// ogni valore si corregge a mano prima di pubblicarlo, perché i referti dei laboratori non hanno
// un formato comune. Il modulo è puro: lo usano sia il server sia il back office (Rileggi).

export type ValueGroup = 'chimica' | 'nutrizionale' | 'organolettica' | 'altro'

export type AnalysisValue = {
  key: string
  label: string
  group: ValueGroup
  /** Come scritto nel referto, con il punto decimale: "0.21", "< 0.1", o un testo. */
  value: string
  unit: string | null
}

export type NutritionBasis = '100 g' | '100 ml'

export type AnalysisResults = {
  markdown: string
  values: AnalysisValue[]
  nutrition_basis: NutritionBasis
}

type KnownValue = {
  key: string
  label: string
  group: ValueGroup
  unit: string | null
  /** Riconosce l'etichetta del parametro nella riga del referto. */
  match: RegExp
  /** Testo libero invece di un numero (es. origine botanica, descrittori). */
  text?: boolean
}

// L'ordine conta: vince la prima voce che riconosce la riga, quindi le più specifiche stanno
// prima ("acidi grassi saturi" prima di "grassi", "kcal" prima di "kJ").
export const KNOWN_VALUES: KnownValue[] = [
  { key: 'acidita', label: 'Acidità libera', group: 'chimica', unit: '% acido oleico', match: /acidit[àa]|acidi grassi liberi|free fatty acid/i },
  { key: 'perossidi', label: 'Numero di perossidi', group: 'chimica', unit: 'meq O2/kg', match: /perossid|peroxide/i },
  { key: 'delta_k', label: 'Delta K', group: 'chimica', unit: null, match: /delta\s*k|Δ\s*k/i },
  { key: 'k232', label: 'K232', group: 'chimica', unit: null, match: /\bk\s*232\b/i },
  { key: 'k270', label: 'K270', group: 'chimica', unit: null, match: /\bk\s*270\b/i },
  { key: 'etil_esteri', label: 'Esteri etilici degli acidi grassi', group: 'chimica', unit: 'mg/kg', match: /esteri etilici|etil\s*esteri|ethyl esters/i },
  { key: 'cere', label: 'Cere', group: 'chimica', unit: 'mg/kg', match: /\bcere\b|\bwax/i },
  { key: 'polifenoli', label: 'Polifenoli totali', group: 'chimica', unit: 'mg/kg', match: /polifenol|biofenol|phenol/i },
  { key: 'umidita', label: 'Umidità', group: 'chimica', unit: '%', match: /umidit[àa]|moisture/i },
  { key: 'hmf', label: 'HMF', group: 'chimica', unit: 'mg/kg', match: /\bhmf\b|idrossimetilfurfurale|hydroxymethylfurfural/i },
  { key: 'diastasi', label: 'Attività diastasica', group: 'chimica', unit: 'Schade', match: /diastas/i },
  { key: 'conducibilita', label: 'Conducibilità elettrica', group: 'chimica', unit: 'mS/cm', match: /conducibilit|conductivity/i },
  { key: 'origine_botanica', label: 'Origine botanica', group: 'altro', unit: null, match: /origine botanica|analisi pollinica|botanical origin/i, text: true },

  { key: 'energia_kcal', label: 'Energia (kcal)', group: 'nutrizionale', unit: 'kcal', match: /^(?=.*(energia|energy|valore energetico)).*kcal/i },
  { key: 'energia_kj', label: 'Energia (kJ)', group: 'nutrizionale', unit: 'kJ', match: /energia|energy|valore energetico/i },
  { key: 'monoinsaturi', label: 'di cui acidi grassi monoinsaturi', group: 'nutrizionale', unit: 'g', match: /monoinsatur|mono-insatur|monounsaturated/i },
  { key: 'polinsaturi', label: 'di cui acidi grassi polinsaturi', group: 'nutrizionale', unit: 'g', match: /poli-?i?nsatur|polyunsaturated/i },
  { key: 'saturi', label: 'di cui acidi grassi saturi', group: 'nutrizionale', unit: 'g', match: /\bsaturi\b|\bsaturated\b|\bsaturates\b/i },
  { key: 'grassi', label: 'Grassi', group: 'nutrizionale', unit: 'g', match: /\bgrassi\b|\blipidi\b|\bfat\b/i },
  { key: 'zuccheri', label: 'di cui zuccheri', group: 'nutrizionale', unit: 'g', match: /zuccheri|\bsugars?\b/i },
  { key: 'carboidrati', label: 'Carboidrati', group: 'nutrizionale', unit: 'g', match: /carboidrati|carbohydrate/i },
  { key: 'fibre', label: 'Fibre', group: 'nutrizionale', unit: 'g', match: /\bfibr[ae]\b|\bfibre\b|\bfiber\b/i },
  { key: 'proteine', label: 'Proteine', group: 'nutrizionale', unit: 'g', match: /protein/i },
  { key: 'sale', label: 'Sale', group: 'nutrizionale', unit: 'g', match: /\bsale\b|\bsalt\b/i },

  { key: 'fruttato', label: 'Fruttato', group: 'organolettica', unit: null, match: /fruttato|fruity/i },
  { key: 'amaro', label: 'Amaro', group: 'organolettica', unit: null, match: /\bamaro\b|\bbitter/i },
  { key: 'piccante', label: 'Piccante', group: 'organolettica', unit: null, match: /piccante|pungent/i },
  { key: 'difetti', label: 'Mediana dei difetti', group: 'organolettica', unit: null, match: /difett|defect/i },
  { key: 'descrittori', label: 'Note sensoriali', group: 'organolettica', unit: null, match: /descrittori|note (olfattive|sensoriali|aromatiche)|sentori/i, text: true },
]

export const VALUE_GROUPS = ['chimica', 'nutrizionale', 'organolettica', 'altro'] as const satisfies readonly ValueGroup[]

const NUMBER = /([<>≤≥]\s*)?\d+(?:[.,]\d+)?/
// Un limite di legge, non un risultato: "≤ 0,8".
const LIMIT_CELL = /^\s*(≤|≥|<=|>=|max|min|limite|limit)/i

/** Toglie dalla cella i numeri che non sono risultati: unità, norme e metodi (2568/91, O2, 100 g). */
function withoutNoise(cell: string): string {
  return cell
    .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
    .replace(/\b(reg|regolamento|iso|uni|en|coi|metodo|method|all|annex|norma)\b\.?(\s*[A-Z]*\s*[\d./-]+)*/gi, ' ')
    .replace(/\bO2\b|O₂/gi, ' ')
    .replace(/\/?\s*\b100\s*(g|ml)\b/gi, ' ')
}

function cellsOf(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  return trimmed
    .split(/\s*\|\s*|\t+|\s{2,}/)
    .map((cell) => cell.trim())
    .filter(Boolean)
}

function normalizeNumber(raw: string): string {
  return raw.replace(/\s+/g, ' ').replace(',', '.').replace(/^([<>≤≥])\s*/, '$1 ').trim()
}

/** Il primo numero dopo l'etichetta, saltando metodi, norme e limiti. */
function numberAfterLabel(cells: string[], known: KnownValue): string | null {
  const first = cells[0] ?? ''
  const rest = first.replace(known.match, ' ')
  // Etichetta e valore nella stessa cella ("Acidità 0,21 %"): il numero è dopo l'etichetta.
  const candidates = [rest, ...cells.slice(1)]
  for (const cell of candidates) {
    if (LIMIT_CELL.test(cell)) continue
    const found = withoutNoise(cell).match(NUMBER)
    if (found) return normalizeNumber(found[0])
  }
  return null
}

function textAfterLabel(cells: string[], known: KnownValue): string | null {
  const first = (cells[0] ?? '').replace(known.match, '').replace(/^[\s:.-]+/, '').trim()
  const value = [first, ...cells.slice(1)].filter(Boolean).join(', ').trim()
  return value || null
}

function readLine(line: string, known: KnownValue): string | null {
  const cells = cellsOf(line)
  if (cells.length === 0 || !known.match.test(cells[0])) return null
  return known.text ? textAfterLabel(cells, known) : numberAfterLabel(cells, known)
}

/**
 * Valori riconosciuti nel testo del referto, uno per parametro (il primo trovato). Le righe senza
 * un parametro noto restano solo nel markdown: si aggiungono a mano nel back office.
 */
export function parseAnalysisValues(markdown: string): AnalysisValue[] {
  const found = new Map<string, AnalysisValue>()
  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(#|\|?\s*-{3,})/.test(line)) continue
    for (const known of KNOWN_VALUES) {
      if (found.has(known.key)) continue
      const value = readLine(line, known)
      if (value === null) continue
      found.set(known.key, { key: known.key, label: known.label, group: known.group, value, unit: known.unit })
      // Una riga di energia porta spesso sia kJ sia kcal: si leggono entrambi.
      if (known.key !== 'energia_kcal') break
    }
    readEnergyPair(line, found)
  }
  return DISPLAY_ORDER.flatMap((key) => found.get(key) ?? [])
}

/** Ordine di lettura, come in etichetta: diverso da quello di riconoscimento di KNOWN_VALUES. */
const DISPLAY_ORDER = [
  'acidita', 'perossidi', 'k232', 'k270', 'delta_k', 'etil_esteri', 'cere', 'polifenoli',
  'umidita', 'hmf', 'diastasi', 'conducibilita', 'origine_botanica',
  'energia_kj', 'energia_kcal', 'grassi', 'saturi', 'monoinsaturi', 'polinsaturi', 'carboidrati', 'zuccheri', 'fibre', 'proteine', 'sale',
  'fruttato', 'amaro', 'piccante', 'difetti', 'descrittori',
]

/** "Energia 3389 kJ / 824 kcal": i due numeri vanno ciascuno alla sua unità. */
function readEnergyPair(line: string, found: Map<string, AnalysisValue>) {
  if (!/energia|energy|valore energetico/i.test(line)) return
  const pair = (unit: string) => line.match(new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*${unit}`, 'i'))?.[1]
  for (const [key, unit] of [['energia_kj', 'kJ'], ['energia_kcal', 'kcal']] as const) {
    const value = pair(unit)
    if (!value) continue
    const known = KNOWN_VALUES.find((entry) => entry.key === key)!
    found.set(key, { key, label: known.label, group: known.group, value: normalizeNumber(value), unit: known.unit })
  }
}

/** I valori nutrizionali si riferiscono a 100 ml solo se il referto lo dice. */
export function detectNutritionBasis(markdown: string): NutritionBasis {
  return /per\s*100\s*ml|\/\s*100\s*ml|100\s*ml/i.test(markdown) ? '100 ml' : '100 g'
}

export function analysisResultsFrom(markdown: string): AnalysisResults {
  return { markdown, values: parseAnalysisValues(markdown), nutrition_basis: detectNutritionBasis(markdown) }
}
