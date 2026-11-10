import { INTL_LOCALE, type Locale } from '@/i18n/locales'

// Le date della filiera arrivano da Medusa come giorni di calendario ("2027-12-31"), senza ora:
// si formattano in UTC, altrimenti a ovest di Greenwich diventerebbero il giorno prima.
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/

type Parts = Intl.DateTimeFormatOptions
const DAY: Parts = { day: 'numeric', month: 'long', year: 'numeric' }
const MONTH: Parts = { month: 'long', year: 'numeric' }

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatter(locale: Locale, parts: Parts): Intl.DateTimeFormat {
  const id = `${locale}-${parts === DAY ? 'day' : 'month'}`
  let current = formatters.get(id)
  if (!current) {
    current = new Intl.DateTimeFormat(INTL_LOCALE[locale], { ...parts, timeZone: 'UTC' })
    formatters.set(id, current)
  }
  return current
}

function format(locale: Locale, value: string, parts: Parts): string {
  const match = ISO_DAY.exec(value)
  if (!match) return value
  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return value
  return formatter(locale, parts).format(date)
}

/** "2027-12-31" → "31 dicembre 2027"; un testo che non è una data valida resta com'è. */
export const formatIsoDate = (locale: Locale, value: string): string => format(locale, value, DAY)

/** "2026-10-01" → "ottobre 2026": per la raccolta, che dura settimane, il giorno non serve. */
export const formatIsoMonth = (locale: Locale, value: string): string => format(locale, value, MONTH)
