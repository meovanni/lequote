import type { Entry } from '../drafts'
import type { ContentSchema } from '../schema'
import { tokenPairs, tokenizeEntries } from '../tokens'

const schema: ContentSchema = {
  version: 1,
  tokens: [
    { token: '{partita iva}', key: 'business.SELLER.vat', label: 'Partita IVA' },
    { token: '{email}', key: 'business.SELLER.email', label: 'Email' },
  ],
  sections: [
    {
      id: 'azienda',
      group: 'Azienda',
      label: 'Dati aziendali',
      fields: [
        { key: 'business.SELLER.vat', label: 'P.IVA', kind: 'text', scope: 'shared', defaults: { shared: '[P.IVA da fornire]' } },
        { key: 'business.SELLER.email', label: 'Email', kind: 'text', scope: 'shared', defaults: { shared: 'info@le-quote.it' } },
      ],
    },
    {
      id: 'footer',
      group: 'Home',
      label: 'Piè di pagina',
      fields: [
        { key: 'footer.legal', label: 'Note legali', kind: 'text', scope: 'locale', defaults: { it: 'Le Quote. P.IVA {partita iva}.', en: 'Le Quote. VAT {partita iva}.' } },
      ],
    },
  ],
}

const vat: Entry = { key: 'business.SELLER.vat', scope: 'shared', draft: '02173860673', published: '02173860673' }

describe('segnaposto dei dati aziendali', () => {
  it('riconosce il dato di partenza e quelli salvati, dal più lungo', () => {
    expect(tokenPairs([vat], schema)).toEqual([
      ['[P.IVA da fornire]', '{partita iva}'],
      ['info@le-quote.it', '{email}'],
      ['02173860673', '{partita iva}'],
    ])
  })

  it('una modifica che era solo il dato per esteso torna testo di partenza', () => {
    const entries: Entry[] = [vat, { key: 'footer.legal', scope: 'it', draft: 'Le Quote. P.IVA 02173860673.', published: 'Le Quote. P.IVA 02173860673.' }]
    expect(tokenizeEntries(entries, schema)).toEqual([{ key: 'footer.legal', scope: 'it', draft: null, published: null }])
  })

  it('una modifica vera resta, con il segnaposto al posto del dato', () => {
    const entries: Entry[] = [vat, { key: 'footer.legal', scope: 'en', draft: 'Le Quote farm. VAT 02173860673, info@le-quote.it', published: null }]
    expect(tokenizeEntries(entries, schema)).toEqual([
      { key: 'footer.legal', scope: 'en', draft: 'Le Quote farm. VAT {partita iva}, {email}', published: null },
    ])
  })

  it('i testi senza dati aziendali e i dati stessi non cambiano', () => {
    expect(tokenizeEntries([vat, { key: 'footer.legal', scope: 'it', draft: 'Altro', published: null }], schema)).toEqual([])
  })
})
