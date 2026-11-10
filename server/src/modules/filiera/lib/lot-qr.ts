import QRCode, { type QRCodeToStringOptions, type QRCodeToBufferOptions } from 'qrcode'

// QR da stampare in etichetta (ADR 0005): apre la pagina pubblica del lotto, /lotto/:codice,
// dove si leggono campagna, fasi, analisi e informazioni di legge. Generato in locale, senza
// servizi esterni. Correzione d'errore M (regge piccole abrasioni dell'etichetta) e margine di
// quiete di 4 moduli, come chiede la norma ISO/IEC 18004: senza, molti lettori non lo trovano.
const QR_OPTIONS = {
  errorCorrectionLevel: 'M',
  margin: 4,
  color: { dark: '#000000', light: '#ffffff' },
} as const

/** Lato del PNG in pixel: ~25 mm a 1200 dpi, abbondante per qualsiasi formato di etichetta. */
const PNG_WIDTH = 1200

const DEV_STOREFRONT_URL = 'http://localhost:5173'

export type QrFormat = 'svg' | 'png'

/**
 * Indirizzo pubblico della vetrina, da STOREFRONT_URL. In produzione è obbligatorio: un QR con
 * l'indirizzo sbagliato finirebbe stampato su centinaia di etichette.
 */
export function storefrontUrl(env: Record<string, string | undefined> = process.env): string {
  const value = env.STOREFRONT_URL?.trim()
  if (!value) {
    if (env.NODE_ENV === 'production') {
      throw new Error('STOREFRONT_URL non configurata: serve per l’indirizzo stampato nel QR del lotto.')
    }
    return DEV_STOREFRONT_URL
  }
  if (!/^https?:\/\/[^/\s]+/.test(value)) {
    throw new Error(`STOREFRONT_URL non valida (${value}): deve iniziare con https://.`)
  }
  return value.replace(/\/+$/, '')
}

/**
 * Sito stampato nel QR delle etichette: sempre il dominio vero (https://le-quote.it), anche in
 * sviluppo, perché le etichette si stampano prima di andare online e un QR verso "localhost"
 * finirebbe su centinaia di bottiglie. LABEL_SITE_URL lo cambia solo se cambia il dominio.
 */
export const LABEL_SITE_URL = 'https://le-quote.it'

export function labelSiteUrl(env: Record<string, string | undefined> = process.env): string {
  const value = env.LABEL_SITE_URL?.trim() || LABEL_SITE_URL
  if (!/^https:\/\/[^/\s]+/.test(value)) {
    throw new Error(`LABEL_SITE_URL non valida (${value}): deve iniziare con https://.`)
  }
  return value.replace(/\/+$/, '')
}

/** Pagina pubblica del lotto. Il codice è già nella forma canonica (lot-code.ts). */
export function lotPageUrl(siteUrl: string, code: string): string {
  return `${siteUrl}/lotto/${encodeURIComponent(code)}`
}

/** Codice nell'indirizzo del QR: quello dei QR già stampati, se il codice è cambiato dopo. */
export function lotLinkCode(lot: { code: string; qr_code?: string | null }): string {
  return lot.qr_code || lot.code
}

export function lotQrFileName(code: string, format: QrFormat): string {
  return `qr-lotto-${code}.${format}`
}

/** Vettoriale: il formato da usare per la tipografia e per le etichette in PDF. */
export function lotQrSvg(url: string): Promise<string> {
  const options: QRCodeToStringOptions = { ...QR_OPTIONS, type: 'svg' }
  return QRCode.toString(url, options)
}

/** Raster ad alta risoluzione, per programmi che non accettano SVG. */
export function lotQrPng(url: string): Promise<Buffer> {
  const options: QRCodeToBufferOptions = { ...QR_OPTIONS, type: 'png', width: PNG_WIDTH }
  return QRCode.toBuffer(url, options)
}
