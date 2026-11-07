import { model } from '@medusajs/framework/utils'

// Un testo o una foto del sito cambiati dal back office. I testi di partenza restano nel codice
// della vetrina: qui c'è solo la modifica, in bozza (draft) e com'è online (published). Un valore
// null vuol dire "testo di partenza". Chiavi e ambiti validi: defaults.generated.json.
export const ContentEntry = model
  .define('content_entry', {
    id: model.id({ prefix: 'cnt' }).primaryKey(),
    /** Percorso del testo nei contenuti della vetrina, per esempio "hero.title". */
    key: model.text(),
    /** Lingua del testo, oppure "shared" per foto e dati aziendali uguali in ogni lingua. */
    scope: model.enum(['it', 'en', 'de', 'shared']),
    draft: model.text().nullable(),
    published: model.text().nullable(),
  })
  .indexes([{ on: ['key', 'scope'], unique: true, where: 'deleted_at IS NULL' }])
