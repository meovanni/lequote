import { normalizeChange, pendingCount, publishedShared, toPublished, type Entry } from '../drafts'
import { FIELDS, type ContentField } from '../schema'

const field = (overrides: Partial<ContentField> = {}): ContentField => ({
  key: 'hero.title',
  label: 'Titolo',
  kind: 'text',
  scope: 'locale',
  defaults: { it: 'Le Quote', en: 'Le Quote', de: 'Le Quote' },
  ...overrides,
})

const IMAGE = '/contenuti/immagini/0b0e6c1e-3a4f-4a8e-9a55-2f7f1b7c2d10.jpg'

describe('normalizeChange', () => {
  it('pulisce gli spazi e salva il testo nuovo', () => {
    expect(normalizeChange(field(), 'en', '  The   Heights ')).toEqual({ ok: true, value: 'The Heights' })
  })

  it('nei testi lunghi tiene gli a capo', () => {
    expect(normalizeChange(field({ kind: 'long' }), 'it', 'Riga uno\r\nRiga due\n')).toEqual({ ok: true, value: 'Riga uno\nRiga due' })
  })

  it('vuoto o uguale al testo di partenza vuol dire nessuna modifica', () => {
    expect(normalizeChange(field(), 'it', '')).toEqual({ ok: true, value: null })
    expect(normalizeChange(field(), 'it', null)).toEqual({ ok: true, value: null })
    expect(normalizeChange(field(), 'it', 'Le Quote ')).toEqual({ ok: true, value: null })
  })

  it('rifiuta contenuti sconosciuti, bloccati o nella lingua sbagliata', () => {
    expect(normalizeChange(undefined, 'it', 'x').ok).toBe(false)
    expect(normalizeChange(field({ locked: 'Dicitura imposta dalla legge.' }), 'it', 'x')).toEqual({ ok: false, error: 'Dicitura imposta dalla legge.' })
    expect(normalizeChange(field(), 'shared', 'x').ok).toBe(false)
    expect(normalizeChange(field({ scope: 'shared', defaults: { shared: '' } }), 'it', 'x').ok).toBe(false)
  })

  it('una foto deve essere stata caricata dalla sezione Contenuti', () => {
    const image = field({ kind: 'image', scope: 'shared', defaults: { shared: '/images/oliveto.jpg' } })
    expect(normalizeChange(image, 'shared', IMAGE)).toEqual({ ok: true, value: IMAGE })
    expect(normalizeChange(image, 'shared', 'https://altrosito.it/foto.jpg').ok).toBe(false)
    expect(normalizeChange(image, 'shared', '/contenuti/immagini/../../.env').ok).toBe(false)
  })

  it('un collegamento deve essere un indirizzo completo', () => {
    const link = field({ kind: 'link', defaults: { it: '#' } })
    expect(normalizeChange(link, 'it', 'https://www.instagram.com/lequote')).toEqual({ ok: true, value: 'https://www.instagram.com/lequote' })
    expect(normalizeChange(link, 'it', 'javascript:alert(1)').ok).toBe(false)
  })
})

describe('toPublished', () => {
  const entries: Entry[] = [
    { key: 'hero.title', scope: 'en', draft: 'The Heights', published: null },
    { key: 'hero.subtitle', scope: 'it', draft: null, published: 'Vecchio' },
    { key: 'hero.poster', scope: 'shared', draft: IMAGE, published: IMAGE },
  ]

  it('mette online solo le modifiche in bozza, per lingua; la foto piccola segue la grande', () => {
    expect(toPublished(entries)).toEqual({
      texts: { it: {}, en: { 'hero.title': 'The Heights' }, de: {} },
      shared: { 'hero.poster': IMAGE, 'hero.posterSmall': IMAGE },
    })
  })

  it('conta le modifiche non ancora online', () => {
    expect(pendingCount(entries)).toBe(2)
  })

  it('legge i dati condivisi così come sono online', () => {
    expect(publishedShared([...entries, { key: 'business.BANK_TRANSFER.iban', scope: 'shared', draft: 'IT00B', published: 'IT00A' }])).toEqual({
      'hero.poster': IMAGE,
      'business.BANK_TRANSFER.iban': 'IT00A',
    })
  })
})

describe('elenco dei contenuti generato dalla vetrina', () => {
  it('contiene i campi che il server tratta in modo speciale', () => {
    expect(FIELDS.get('hero.poster')?.kind).toBe('image')
    expect(FIELDS.get('business.BANK_TRANSFER.iban')?.scope).toBe('shared')
    expect(FIELDS.get('checkoutUi.submit')?.locked).toBeTruthy()
    expect(FIELDS.has('hero.posterSmall')).toBe(false)
  })
})
