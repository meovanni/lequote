import { defineRouteConfig } from '@medusajs/admin-sdk'
import { PencilSquare } from '@medusajs/icons'
import { Container, Heading, Text } from '@medusajs/ui'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FieldRow, isModified, isPending, type EntryMap } from '../../components/contenuti/field-row'
import { PublishBar } from '../../components/contenuti/publish-bar'
import { MODIFIED_VIEW, SectionNav } from '../../components/contenuti/section-nav'
import { entryId, useContentSchema, useContentStatus, type ContentField, type ContentSection, type Entry } from '../../lib/contenuti-api'

const MAX_RESULTS = 60

type Row = { field: ContentField; section: ContentSection }

/** Cerca nel nome del campo, nei testi di partenza e in quelli modificati. */
function search(sections: ContentSection[], entries: Entry[], query: string): Row[] {
  const needle = query.trim().toLocaleLowerCase('it')
  const drafts = new Map<string, string[]>()
  for (const entry of entries) {
    if (entry.draft) drafts.set(entry.key, [...(drafts.get(entry.key) ?? []), entry.draft])
  }
  return sections
    .flatMap((section) => section.fields.map((field) => ({ field, section })))
    .filter(({ field }) =>
      [field.label, ...Object.values(field.defaults), ...(drafts.get(field.key) ?? [])].some((text) =>
        text?.toLocaleLowerCase('it').includes(needle),
      ),
    )
    .slice(0, MAX_RESULTS)
}

function countBy(sections: ContentSection[], test: (field: ContentField) => boolean): Map<string, number> {
  return new Map(sections.map((section) => [section.id, section.fields.filter(test).length]))
}

/** Tutti i testi e le foto del sito, modificabili sul posto in tre lingue, con un solo "Pubblica". */
const ContenutiPage = () => {
  const schema = useContentSchema()
  const status = useContentStatus()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const sections = schema.data?.sections ?? []
  const selected = params.get('sezione') ?? sections[0]?.id ?? ''

  const entries: EntryMap = useMemo(
    () => new Map((status.data?.entries ?? []).map((entry) => [entryId(entry.key, entry.scope), entry])),
    [status.data?.entries],
  )
  const modifiedBySection = useMemo(() => countBy(sections, (field) => isModified(field, entries)), [sections, entries])
  const pendingBySection = useMemo(() => countBy(sections, (field) => isPending(field, entries)), [sections, entries])

  if (schema.isLoading || status.isLoading) {
    return <div className="h-96 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />
  }
  if (!schema.data || !status.data) {
    return (
      <Container className="px-6 py-10">
        <Heading level="h1">Contenuti del sito</Heading>
        <Text className="text-ui-fg-error">Non riesco a leggere i contenuti. Ricarica la pagina.</Text>
      </Container>
    )
  }

  const searching = query.trim().length >= 2
  const current = sections.find((section) => section.id === selected)
  const allRows = (keep: (field: ContentField) => boolean) =>
    sections.flatMap((section) => section.fields.filter(keep).map((field) => ({ field, section })))
  const rows: Row[] = searching
    ? search(sections, status.data.entries, query)
    : selected === MODIFIED_VIEW
      ? allRows((field) => isModified(field, entries) || isPending(field, entries))
      : (current?.fields ?? []).map((field) => ({ field, section: current as ContentSection }))
  const showSection = searching || selected === MODIFIED_VIEW
  const heading = searching ? `Risultati per “${query.trim()}”` : selected === MODIFIED_VIEW ? 'Tutte le modifiche' : current?.label

  return (
    <Container className="divide-y p-0">
      <PublishBar status={status.data} />
      <div className="grid md:grid-cols-[15rem_1fr]">
        <div className="border-ui-border-base px-4 py-4 md:border-r">
          <SectionNav
            sections={sections}
            selected={selected}
            query={query}
            modifiedBySection={modifiedBySection}
            pendingBySection={pendingBySection}
            onSelect={(id) => {
              setQuery('')
              setParams({ sezione: id }, { replace: true })
            }}
            onQuery={setQuery}
          />
        </div>
        <section aria-label={heading} className="min-w-0 divide-y">
          <div className="px-6 py-3">
            <Heading level="h2">{heading}</Heading>
          </div>
          {rows.length === 0 && (
            <Text size="small" className="px-6 py-6 text-ui-fg-subtle">
              {searching ? 'Nessun testo trovato.' : 'Nessuna modifica: il sito mostra i testi di partenza.'}
            </Text>
          )}
          {rows.map(({ field, section }) => (
            <FieldRow
              key={field.key}
              field={field}
              entries={entries}
              storefront={status.data.storefront}
              sectionLabel={showSection ? `${section.group} › ${section.label}` : undefined}
            />
          ))}
          {searching && rows.length === MAX_RESULTS && (
            <Text size="small" className="px-6 py-4 text-ui-fg-subtle">
              Mostro i primi {MAX_RESULTS} risultati: scrivi qualche parola in più.
            </Text>
          )}
        </section>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({ label: 'Contenuti del sito', icon: PencilSquare, rank: 5 })

export default ContenutiPage
