import { MedusaError, MedusaService } from '@medusajs/framework/utils'
import { normalizeChange, pendingCount, publishedShared, toPublished, type Entry, type PublishedContent } from './lib/drafts'
import { FIELDS, type Scope } from './lib/schema'
import { ContentEntry } from './models/content-entry'
import { ContentPublication } from './models/content-publication'

/** Una pubblicazione ferma da più di così si considera interrotta (server riavviato a metà). */
const STALE_AFTER_MS = 20 * 60 * 1000

export type PublicationRecord = {
  id: string
  status: 'running' | 'done' | 'failed'
  changes: number
  error: string | null
  created_at: Date
  finished_at: Date | null
}

class ContenutiModuleService extends MedusaService({ ContentEntry, ContentPublication }) {
  async listEntries(): Promise<Entry[]> {
    const rows = await this.listContentEntries({}, { take: null })
    return rows.map(({ key, scope, draft, published }) => ({ key, scope: scope as Scope, draft, published }))
  }

  /** Salva in bozza un testo o una foto; null o il testo di partenza tolgono la modifica. */
  async saveDraft(key: string, scope: Scope, value: string | null): Promise<Entry> {
    const change = normalizeChange(FIELDS.get(key), scope, value)
    if (!change.ok) throw new MedusaError(MedusaError.Types.INVALID_DATA, change.error)

    const [existing] = await this.listContentEntries({ key, scope })
    if (existing) {
      const updated = await this.updateContentEntries({ id: existing.id, draft: change.value })
      return { key, scope, draft: updated.draft, published: updated.published }
    }
    if (change.value === null) return { key, scope, draft: null, published: null }
    const created = await this.createContentEntries({ key, scope, draft: change.value, published: null })
    return { key, scope, draft: created.draft, published: created.published }
  }

  /** Riporta la bozza a com'è online. */
  async discardDrafts(): Promise<number> {
    const rows = await this.listContentEntries({}, { take: null })
    const pending = rows.filter((row) => row.draft !== row.published)
    const unpublished = pending.filter((row) => row.published === null).map((row) => row.id)
    if (unpublished.length) await this.deleteContentEntries(unpublished)
    const reverted = pending.filter((row) => row.published !== null).map((row) => ({ id: row.id, draft: row.published }))
    if (reverted.length) await this.updateContentEntries(reverted)
    return pending.length
  }

  async latestPublication(): Promise<PublicationRecord | null> {
    const [latest] = await this.listContentPublications({}, { order: { created_at: 'DESC' }, take: 1 })
    return (latest as PublicationRecord | undefined) ?? null
  }

  /**
   * Apre una pubblicazione e fotografa la bozza: va online esattamente questa, anche se nel
   * frattempo qualcuno continua a modificare.
   */
  async startPublication(): Promise<{ publication: PublicationRecord; snapshot: Entry[]; content: PublishedContent }> {
    const latest = await this.latestPublication()
    if (latest?.status === 'running' && Date.now() - new Date(latest.created_at).getTime() < STALE_AFTER_MS) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, 'C’è già una pubblicazione in corso: aspetta che finisca.')
    }
    if (latest?.status === 'running') {
      await this.updateContentPublications({ id: latest.id, status: 'failed', error: 'Interrotta.', finished_at: new Date() })
    }
    const snapshot = await this.listEntries()
    const publication = await this.createContentPublications({ status: 'running', changes: pendingCount(snapshot) })
    return { publication: publication as PublicationRecord, snapshot, content: toPublished(snapshot) }
  }

  /** La vetrina ha le modifiche: la bozza fotografata diventa il testo online. */
  async completePublication(id: string, snapshot: Entry[]): Promise<void> {
    const rows = await this.listContentEntries({}, { take: null })
    const byKey = new Map(rows.map((row) => [`${row.scope}:${row.key}`, row]))
    const updates: { id: string; published: string | null }[] = []
    const removals: string[] = []
    for (const entry of snapshot) {
      const row = byKey.get(`${entry.scope}:${entry.key}`)
      if (!row) continue
      // Tolta la modifica e pubblicato il testo di partenza: la riga non serve più.
      if (entry.draft === null && row.draft === null) removals.push(row.id)
      else if (row.published !== entry.draft) updates.push({ id: row.id, published: entry.draft })
    }
    if (updates.length) await this.updateContentEntries(updates)
    if (removals.length) await this.deleteContentEntries(removals)
    await this.updateContentPublications({ id, status: 'done', finished_at: new Date() })
  }

  async failPublication(id: string, error: string): Promise<void> {
    await this.updateContentPublications({ id, status: 'failed', error: error.slice(0, 4000), finished_at: new Date() })
  }

  /** Foto e dati aziendali come sono online (per esempio l'IBAN nelle email d'ordine). */
  async publishedShared(): Promise<Record<string, string>> {
    return publishedShared(await this.listEntries())
  }
}

export default ContenutiModuleService
