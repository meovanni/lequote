import { INTL_LOCALE, type Locale } from '@/i18n/locales'

// Un formattatore per lingua, creato una volta sola. Senza decimali quando il prezzo è intero.
const formatters = new Map<Locale, Intl.NumberFormat>()

export function formatPrice(locale: Locale, value: number): string {
  let formatter = formatters.get(locale)
  if (!formatter) {
    formatter = new Intl.NumberFormat(INTL_LOCALE[locale], {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
    formatters.set(locale, formatter)
  }
  return formatter.format(value)
}
