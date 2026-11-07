import { toast } from '@medusajs/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sdk } from './sdk'

// Sezione Contenuti (src/api/admin/contenuti): testi e foto del sito in bozza, poi "Pubblica".
// I testi di partenza stanno nel codice della vetrina; qui arrivano con l'elenco dei campi.

export type Locale = 'it' | 'en' | 'de'
export type Scope = Locale | 'shared'

export type ContentField = {
  key: string
  label: string
  kind: 'text' | 'long' | 'image' | 'link'
  scope: 'locale' | 'shared'
  locked?: string
  defaults: Partial<Record<Scope, string>>
}

export type ContentSection = { id: string; group: string; label: string; fields: ContentField[] }

export type Entry = { key: string; scope: Scope; draft: string | null; published: string | null }

export type Publication = {
  id: string
  status: 'running' | 'done' | 'failed'
  changes: number
  error: string | null
  created_at: string
  finished_at: string | null
}

export type ContentStatus = {
  entries: Entry[]
  pending: number
  publication: Publication | null
  rebuilds: boolean
  storefront: string | null
}

export const LOCALES: Locale[] = ['it', 'en', 'de']
export const LOCALE_LABEL: Record<Locale, string> = { it: 'Italiano', en: 'Inglese', de: 'Tedesco' }

const ROOT = ['contenuti']
const STATUS = [...ROOT, 'stato']

export const entryId = (key: string, scope: Scope) => `${scope}:${key}`

export function useContentSchema() {
  return useQuery({
    queryKey: [...ROOT, 'schema'],
    queryFn: () => sdk.client.fetch<{ sections: ContentSection[] }>('/admin/contenuti/schema'),
    staleTime: Infinity,
  })
}

/** Durante una pubblicazione lo stato si ricarica ogni due secondi, finché non finisce. */
export function useContentStatus() {
  return useQuery({
    queryKey: STATUS,
    queryFn: () => sdk.client.fetch<ContentStatus>('/admin/contenuti'),
    refetchInterval: (query) => (query.state.data?.publication?.status === 'running' ? 2000 : false),
  })
}

/** Salva un testo o una foto in bozza; null torna al testo di partenza. */
export function useSaveDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { key: string; scope: Scope; value: string | null }) =>
      sdk.client.fetch<{ entry: Entry }>('/admin/contenuti/testi', { method: 'POST', body }),
    onSuccess: ({ entry }) => {
      queryClient.setQueryData<ContentStatus>(STATUS, (current) => {
        if (!current) return current
        const id = entryId(entry.key, entry.scope)
        const others = current.entries.filter((row) => entryId(row.key, row.scope) !== id)
        const keep = entry.draft !== null || entry.published !== null
        const entries = keep ? [...others, entry] : others
        return { ...current, entries, pending: entries.filter((row) => row.draft !== row.published).length }
      })
    },
    onError: (error: Error) => toast.error(error.message || 'Modifica non salvata.'),
  })
}

const MAX_IMAGE_MB = 10

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(new Error('Lettura della foto non riuscita.'))
    reader.readAsDataURL(file)
  })
}

/** Carica la foto e la mette in bozza sul campo. */
export function useUploadImage() {
  const save = useSaveDraft()
  return useMutation({
    mutationFn: async ({ key, file }: { key: string; file: File }) => {
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) throw new Error(`La foto supera ${MAX_IMAGE_MB} MB: riducila prima di caricarla.`)
      const { url } = await sdk.client.fetch<{ url: string }>('/admin/contenuti/immagini', {
        method: 'POST',
        body: { file_base64: await toBase64(file) },
      })
      return save.mutateAsync({ key, scope: 'shared', value: url })
    },
    onSuccess: () => toast.success('Foto caricata: comparirà sul sito dopo "Pubblica".'),
    onError: (error: Error) => toast.error(error.message || 'Foto non caricata.'),
  })
}

export function usePublish() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => sdk.client.fetch<{ publication: Publication }>('/admin/contenuti/pubblica', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STATUS }),
    onError: (error: Error) => toast.error(error.message || 'Pubblicazione non avviata.'),
  })
}

export function useDiscardDrafts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => sdk.client.fetch<{ discarded: number }>('/admin/contenuti/annulla', { method: 'POST' }),
    onSuccess: ({ discarded }) => {
      queryClient.invalidateQueries({ queryKey: STATUS })
      toast.success(discarded === 1 ? 'Annullata 1 modifica.' : `Annullate ${discarded} modifiche.`)
    },
    onError: (error: Error) => toast.error(error.message || 'Operazione non riuscita.'),
  })
}

/** Indirizzo da mostrare in anteprima: le foto caricate le serve il back office, quelle di partenza la vetrina. */
export function imagePreview(path: string, storefront: string | null): string | null {
  if (!path) return null
  if (path.startsWith('/contenuti/')) return path
  return storefront ? `${storefront}${path}` : null
}
