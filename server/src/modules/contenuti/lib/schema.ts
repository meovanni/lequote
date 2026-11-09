import generated from '../defaults.generated.json'

// Elenco dei contenuti modificabili, generato dalla vetrina ("npm run content:export" in client/):
// sezioni, campi, testi di partenza nelle tre lingue. Il back office lo mostra; il server accetta
// solo chiavi che stanno qui.

export type Locale = 'it' | 'en' | 'de'
export type Scope = Locale | 'shared'
export type FieldKind = 'text' | 'long' | 'image' | 'link'

export const LOCALES: Locale[] = ['it', 'en', 'de']

export interface ContentField {
  key: string
  label: string
  kind: FieldKind
  scope: 'locale' | 'shared'
  locked?: string
  defaults: Partial<Record<Scope, string>>
}

export interface ContentSection {
  id: string
  group: string
  label: string
  fields: ContentField[]
}

export interface ContentToken {
  token: string
  /** Campo dei dati aziendali da cui il segnaposto prende il valore ("business.SELLER.vat"). */
  key: string
  label: string
}

export interface ContentSchema {
  version: 1
  sections: ContentSection[]
  /** Segnaposto dei dati aziendali nei testi ({partita iva}), vedi lib/tokens.ts. */
  tokens: ContentToken[]
}

export const CONTENT_SCHEMA = generated as unknown as ContentSchema

export function fieldIndex(schema: ContentSchema): Map<string, ContentField> {
  return new Map(schema.sections.flatMap((section) => section.fields.map((field) => [field.key, field] as const)))
}

export const FIELDS = fieldIndex(CONTENT_SCHEMA)

export function scopesFor(field: ContentField): Scope[] {
  return field.scope === 'shared' ? ['shared'] : LOCALES
}
