import type { Locale } from '@/i18n/locales'
import { formatAnalysisValue, type AnalysisValue, type ValueGroup } from '@/lib/medusa/analyses'

// Righe leggibili dai valori delle analisi: etichetta nella lingua della pagina (per i parametri
// noti), numeri con la virgola dove si usa, unità accanto al valore. kJ e kcal diventano una sola
// riga "Energia", come nelle dichiarazioni nutrizionali in etichetta.

export interface ValueRow {
  key: string
  label: string
  value: string
}

export interface ValueLabels {
  valueLabels: Record<string, string>
  units: Record<string, string>
}

function withUnit(locale: Locale, value: AnalysisValue, labels: ValueLabels): string {
  const unit = labels.units[value.key] ?? value.unit
  const formatted = formatAnalysisValue(locale, value.value)
  if (!unit) return formatted
  return unit.startsWith('%') ? `${formatted}${unit === '%' ? '%' : ` ${unit}`}` : `${formatted} ${unit}`
}

export function valueRows(values: AnalysisValue[], group: ValueGroup, locale: Locale, labels: ValueLabels): ValueRow[] {
  // Ordine di etichetta (Grassi prima di "di cui saturi"): quello delle etichette tradotte; i
  // parametri aggiunti a mano vanno in fondo, nell'ordine del back office.
  const order = Object.keys(labels.valueLabels)
  const rank = (key: string) => (order.includes(key) ? order.indexOf(key) : order.length)
  const inGroup = values.filter((value) => value.group === group).sort((a, b) => rank(a.key) - rank(b.key))
  const kj = inGroup.find((value) => value.key === 'energia_kj')
  const kcal = inGroup.find((value) => value.key === 'energia_kcal')
  return inGroup.flatMap((value): ValueRow[] => {
    if (value.key === 'energia_kcal' && kj) return []
    const label = labels.valueLabels[value.key] ?? value.label
    if (value.key === 'energia_kj' && kcal) {
      return [{ key: 'energia', label, value: `${withUnit(locale, value, labels)} / ${withUnit(locale, kcal, labels)}` }]
    }
    return [{ key: value.key, label, value: withUnit(locale, value, labels) }]
  })
}

/** Il valore di un parametro con la sua unità, o null se il referto non lo riporta. */
export function valueText(value: AnalysisValue | undefined, locale: Locale, labels: ValueLabels): string | null {
  return value ? withUnit(locale, value, labels) : null
}
