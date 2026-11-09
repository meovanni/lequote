import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { CONTENUTI_MODULE } from '../modules/contenuti'
import { CONTENT_SCHEMA } from '../modules/contenuti/lib/schema'
import { tokenizeEntries } from '../modules/contenuti/lib/tokens'
import type ContenutiModuleService from '../modules/contenuti/service'

// Segnaposto dei dati aziendali nei testi (2026-11-09): le modifiche salvate prima, con la P.IVA
// o la sede scritte per esteso, passano ai segnaposto ({partita iva}). Quelle che erano solo il
// dato tornano testo di partenza. Gira una volta sola con "medusa db:migrate".
export default async function contentBusinessTokens({ container }: ExecArgs) {
  const contenuti: ContenutiModuleService = container.resolve(CONTENUTI_MODULE)
  const rows = await contenuti.listContentEntries({}, { take: null })
  const entries = rows.map(({ key, scope, draft, published }) => ({ key, scope, draft, published })) as Parameters<typeof tokenizeEntries>[0]
  const changed = tokenizeEntries(entries, CONTENT_SCHEMA)
  const idOf = (key: string, scope: string) => rows.find((row) => row.key === key && row.scope === scope)?.id as string

  const removals = changed.filter((entry) => entry.draft === null && entry.published === null).map((entry) => idOf(entry.key, entry.scope))
  const updates = changed
    .filter((entry) => entry.draft !== null || entry.published !== null)
    .map((entry) => ({ id: idOf(entry.key, entry.scope), draft: entry.draft, published: entry.published }))
  if (removals.length) await contenuti.deleteContentEntries(removals)
  if (updates.length) await contenuti.updateContentEntries(updates)
  container
    .resolve(ContainerRegistrationKeys.LOGGER)
    .info(`Segnaposto dei dati aziendali: ${removals.length} testi tornati di partenza, ${updates.length} convertiti.`)
}
