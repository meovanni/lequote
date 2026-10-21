import jsQR from 'jsqr'
import { PNG } from 'pngjs'
import { lotPageUrl, lotQrFileName, lotQrPng, lotQrSvg, storefrontUrl } from '../lot-qr'

describe('storefrontUrl', () => {
  it('usa STOREFRONT_URL senza la barra finale', () => {
    expect(storefrontUrl({ STOREFRONT_URL: 'https://lequote.it/' })).toBe('https://lequote.it')
  })

  it('in sviluppo ricade sulla vetrina locale', () => {
    expect(storefrontUrl({ NODE_ENV: 'development' })).toBe('http://localhost:5173')
  })

  it('in produzione senza indirizzo si ferma invece di stampare un QR sbagliato', () => {
    expect(() => storefrontUrl({ NODE_ENV: 'production' })).toThrow(/STOREFRONT_URL/)
  })

  it('rifiuta un indirizzo che non è http o https', () => {
    expect(() => storefrontUrl({ STOREFRONT_URL: 'lequote.it' })).toThrow(/STOREFRONT_URL/)
  })
})

describe('lotPageUrl', () => {
  it('punta alla pagina del lotto con il codice canonico', () => {
    expect(lotPageUrl('https://lequote.it', 'L2026-07')).toBe('https://lequote.it/lotto/L2026-07')
  })
})

describe('lotQrFileName', () => {
  it('nomina il file con il codice del lotto', () => {
    expect(lotQrFileName('L2026-07', 'svg')).toBe('qr-lotto-L2026-07.svg')
    expect(lotQrFileName('L2026-07', 'png')).toBe('qr-lotto-L2026-07.png')
  })
})

describe('QR del lotto', () => {
  const url = 'https://lequote.it/lotto/L2026-07'
  let png: PNG

  // Sotto Jest la codifica PNG (JavaScript puro) è molto più lenta che in Node: si fa una volta.
  beforeAll(async () => {
    png = PNG.sync.read(await lotQrPng(url))
  }, 60_000)

  it('il PNG si legge e riporta l’indirizzo della pagina', () => {
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)
    expect(decoded?.data).toBe(url)
  })

  it('il PNG è abbastanza grande per la stampa', () => {
    expect(png.width).toBeGreaterThanOrEqual(1000)
  })

  it('l’SVG è vettoriale, nero su bianco e con il margine di quiete', async () => {
    const svg = await lotQrSvg(url)
    expect(svg).toMatch(/^<svg[^>]+viewBox="0 0 (\d+) \1"/)
    expect(svg).toContain('#000000')
    expect(svg).toContain('#ffffff')
    expect(svg).not.toMatch(/<image|<script/)
  })
})
