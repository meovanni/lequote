import { INTL_LOCALE, type Locale } from '@/i18n/locales'

// Le date della filiera arrivano da Medusa come giorni di calendario ("2027-12-31"), senza ora:
// si formattano in UTC, altrimenti a ovest di Greenwich diventerebbero il giorno prima.
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/

const formatters = new Map<Locale, Intl.DateTimeFormat>()

function formatter(locale: Locale): Intl.DateTimeFormat {
  let current = formatters.get(locale)
  if (!current) {
    current = new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    formatters.set(locale, current)
  }
  return current
}

/** "2027-12-31" → "31 dicembre 2027"; un testo che non è una data valida resta com'è. */
export function formatIsoDate(locale: Locale, value: string): string {
  const match = ISO_DAY.exec(value)
  if (!match) return value
  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return value
  return formatter(locale).format(date)
}
