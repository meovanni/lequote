/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildContentSchema, serializeSchema, unassignedKeys } from './schema'

// In jsdom import.meta.url non è un file: il percorso parte dalla cartella client (dove gira Vitest).
const SERVER_COPY = join(process.cwd(), '..', 'server', 'src', 'modules', 'contenuti', 'defaults.generated.json')

describe('contenuti modificabili dal back office', () => {
  const schema = buildContentSchema()
  const fields = schema.sections.flatMap((section) => section.fields)

  it('il server ha l’elenco aggiornato: dopo aver cambiato i testi lancia "npm run content:export"', () => {
    expect(readFileSync(SERVER_COPY, 'utf8').replace(/\r\n/g, '\n')).toBe(serializeSchema(schema))
  })

  it('ogni testo modificabile sta in una sezione, una sola volta', () => {
    expect(unassignedKeys(schema)).toEqual([])
    const keys = fields.map((field) => field.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('identificatori e collegamenti interni restano fuori', () => {
    const keys = fields.map((field) => field.key)
    expect(keys.some((key) => /\.(id|sku|handle|line)$/.test(key))).toBe(false)
    expect(keys).not.toContain('hero.ctaPrimary.href')
    expect(keys).not.toContain('hero.posterSmall')
    expect(keys).toContain('footer.social.0.href')
  })

  it('foto e dati aziendali sono uguali in ogni lingua; i testi hanno l’italiano', () => {
    for (const field of fields) {
      if (field.kind === 'image' || field.key.startsWith('business.')) {
        expect(field.scope).toBe('shared')
      } else if (field.key !== 'legal.ui.translationNotice') {
        // L'avviso "in caso di dubbio prevale l'italiano" esiste solo nelle traduzioni.
        expect(field.defaults.it, field.key).toBeTypeOf('string')
      }
    }
    expect(fields.filter((field) => field.kind === 'image').map((field) => field.key)).toEqual(
      expect.arrayContaining(['hero.poster', 'olio.image', 'miele.imageAlt', 'shopCatalog.0.variants.0.image']),
    )
  })

  it('nei testi i dati aziendali sono segnaposto; i campi che sono solo un dato si cambiano in Dati aziendali', () => {
    const byKey = new Map(fields.map((field) => [field.key, field]))
    expect(byKey.get('footer.legal')?.defaults.it).toContain('{partita iva}')
    expect(byKey.get('legal.documents.condizioni-di-vendita.sections.0.body.0')?.defaults.de).toContain('{sede legale}')
    expect(byKey.get('contatti.phone')?.locked).toMatch(/Dati aziendali/)
    expect(byKey.get('business.SELLER.vat')?.defaults.shared).not.toContain('{')
    expect(schema.tokens.map((token) => token.key)).toContain('business.SELLER.vat')
  })

  it('lo stesso testo non compare due volte: formati, menu in fondo, pagamento al ritiro', () => {
    const keys = fields.map((field) => field.key)
    expect(keys.some((key) => /^shopCatalog.d+.variants.d+.label$/.test(key))).toBe(false)
    expect(keys.filter((key) => key.startsWith('footerExtraNavItems.'))).toHaveLength(2)
    expect(keys).not.toContain('orderUi.pickupPaymentBody')
  })

  it('le diciture imposte dalla legge sono bloccate', () => {
    const locked = fields.filter((field) => field.locked).map((field) => field.key)
    expect(locked).toEqual(
      expect.arrayContaining(['checkoutUi.submit', 'legal.withdrawalForm.openButton', 'legal.withdrawalForm.confirmButton']),
    )
  })
})
