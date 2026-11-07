import { LockClosedSolid } from '@medusajs/icons'
import { Badge, Text } from '@medusajs/ui'
import { LOCALE_LABEL, LOCALES, entryId, useSaveDraft, type ContentField, type Entry, type Scope } from '../../lib/contenuti-api'
import { ContentText } from './content-text'
import { ImageField } from './image-field'

export type EntryMap = Map<string, Entry>

/** Valore mostrato (la bozza o il testo di partenza) e se è cambiato o deve ancora andare online. */
export function fieldState(field: ContentField, scope: Scope, entries: EntryMap) {
  const entry = entries.get(entryId(field.key, scope))
  return {
    value: entry?.draft ?? field.defaults[scope] ?? '',
    modified: entry?.draft != null,
    pending: entry !== undefined && entry.draft !== entry.published,
  }
}

const scopesOf = (field: ContentField): Scope[] => (field.scope === 'shared' ? ['shared'] : LOCALES)

export const isModified = (field: ContentField, entries: EntryMap) => scopesOf(field).some((scope) => fieldState(field, scope, entries).modified)
export const isPending = (field: ContentField, entries: EntryMap) => scopesOf(field).some((scope) => fieldState(field, scope, entries).pending)

function ScopeStatus({ modified, pending, onRestore }: { modified: boolean; pending: boolean; onRestore: () => void }) {
  return (
    <span className="flex items-center gap-2">
      {pending && (
        <Badge size="2xsmall" color="orange">
          da pubblicare
        </Badge>
      )}
      {modified && (
        <button type="button" onClick={onRestore} className="txt-compact-xsmall text-ui-fg-interactive hover:underline">
          Testo di partenza
        </button>
      )}
    </span>
  )
}

type FieldRowProps = { field: ContentField; entries: EntryMap; storefront: string | null; sectionLabel?: string }

/** Un contenuto del sito: le tre lingue affiancate, oppure un solo valore per foto e dati aziendali. */
export function FieldRow({ field, entries, storefront, sectionLabel }: FieldRowProps) {
  const save = useSaveDraft()
  const title = (
    <div className="flex flex-col gap-0.5">
      {sectionLabel && <Text size="xsmall" className="text-ui-fg-muted">{sectionLabel}</Text>}
      <Text size="small" weight="plus">
        {field.label}
      </Text>
      {field.locked && (
        <Text size="xsmall" className="flex items-start gap-1 text-ui-fg-subtle">
          <LockClosedSolid className="mt-px shrink-0" />
          {field.locked}
        </Text>
      )}
    </div>
  )

  if (field.kind === 'image') {
    return (
      <div className="grid gap-3 px-6 py-4 md:grid-cols-[14rem_1fr]">
        {title}
        <ImageField field={field} state={fieldState(field, 'shared', entries)} storefront={storefront} />
      </div>
    )
  }

  const italianChanged = field.scope === 'locale' && fieldState(field, 'it', entries).modified
  return (
    <div className="grid gap-3 px-6 py-4 md:grid-cols-[14rem_1fr]">
      {title}
      <div className={field.scope === 'shared' ? 'max-w-xl' : 'grid gap-3 lg:grid-cols-3'}>
        {scopesOf(field).map((scope) => {
          const state = fieldState(field, scope, entries)
          const label = scope === 'shared' ? field.label : `${field.label} (${LOCALE_LABEL[scope]})`
          // Cambiato l'italiano, una traduzione rimasta quella di partenza va riletta.
          const checkTranslation = italianChanged && scope !== 'it' && !state.modified
          return (
            <div key={scope} className="flex min-w-0 flex-col gap-1">
              <div className="flex min-h-5 items-center justify-between gap-2">
                <Text size="xsmall" className="uppercase text-ui-fg-muted">
                  {scope === 'shared' ? 'Tutte le lingue' : scope}
                </Text>
                <ScopeStatus
                  modified={state.modified}
                  pending={state.pending}
                  onRestore={() => save.mutate({ key: field.key, scope, value: null })}
                />
              </div>
              <ContentText
                value={state.value}
                label={label}
                multiline={field.kind === 'long'}
                modified={state.modified}
                disabled={Boolean(field.locked)}
                onSave={(value) => save.mutate({ key: field.key, scope, value })}
              />
              {checkTranslation && (
                <Text size="xsmall" className="text-ui-tag-orange-text">
                  L’italiano è cambiato: controlla la traduzione.
                </Text>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
