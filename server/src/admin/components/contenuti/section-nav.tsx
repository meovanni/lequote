import { MagnifyingGlass } from '@medusajs/icons'
import { Input, Text, clx } from '@medusajs/ui'
import type { ContentSection } from '../../lib/contenuti-api'

export const MODIFIED_VIEW = 'modificati'

type SectionNavProps = {
  sections: ContentSection[]
  selected: string
  query: string
  /** Contenuti cambiati per sezione (rispetto al testo di partenza). */
  modifiedBySection: Map<string, number>
  pendingBySection: Map<string, number>
  onSelect: (id: string) => void
  onQuery: (query: string) => void
}

function Item({ active, label, count, pending, onClick }: { active: boolean; label: string; count: number; pending: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={clx(
        'txt-compact-small flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left transition-colors',
        active ? 'bg-ui-bg-base-pressed text-ui-fg-base' : 'text-ui-fg-subtle hover:bg-ui-bg-base-hover',
      )}
    >
      <span className="truncate">{label}</span>
      {count > 0 && (
        <span className="flex items-center gap-1 text-ui-fg-muted">
          {pending && <span className="h-1.5 w-1.5 rounded-full bg-ui-tag-orange-icon" aria-label="da pubblicare" />}
          {count}
        </span>
      )}
    </button>
  )
}

/** Ricerca e sezioni del sito raggruppate per pagina; il numero dice quanti contenuti sono cambiati. */
export function SectionNav({ sections, selected, query, modifiedBySection, pendingBySection, onSelect, onQuery }: SectionNavProps) {
  const groups = [...new Set(sections.map((section) => section.group))]
  const totalModified = [...modifiedBySection.values()].reduce((sum, count) => sum + count, 0)
  const totalPending = [...pendingBySection.values()].reduce((sum, count) => sum + count, 0)
  const searching = query.trim().length >= 2

  return (
    <nav aria-label="Sezioni del sito" className="flex flex-col gap-4 md:sticky md:top-4">
      <div className="relative">
        <MagnifyingGlass className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
        <Input
          size="small"
          type="search"
          placeholder="Cerca un testo"
          aria-label="Cerca un testo in tutto il sito"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          className="pl-7"
        />
      </div>
      <Item
        active={!searching && selected === MODIFIED_VIEW}
        label="Tutte le modifiche"
        count={totalModified}
        pending={totalPending > 0}
        onClick={() => onSelect(MODIFIED_VIEW)}
      />
      {groups.map((group) => (
        <div key={group} className="flex flex-col gap-0.5">
          <Text size="xsmall" weight="plus" className="px-2 uppercase text-ui-fg-muted">
            {group}
          </Text>
          {sections
            .filter((section) => section.group === group)
            .map((section) => (
              <Item
                key={section.id}
                active={!searching && selected === section.id}
                label={section.label}
                count={modifiedBySection.get(section.id) ?? 0}
                pending={(pendingBySection.get(section.id) ?? 0) > 0}
                onClick={() => onSelect(section.id)}
              />
            ))}
        </div>
      ))}
    </nav>
  )
}
