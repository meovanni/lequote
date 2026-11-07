import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { CONTENUTI_MODULE } from '../../../modules/contenuti'
import { pendingCount } from '../../../modules/contenuti/lib/drafts'
import { publisherConfig } from '../../../modules/contenuti/lib/publisher'
import type ContenutiModuleService from '../../../modules/contenuti/service'
import { storefrontUrl } from '../../../modules/filiera/lib/lot-qr'

function storefront(): string | null {
  try {
    return storefrontUrl()
  } catch {
    return null
  }
}

/** Modifiche in bozza e online, stato dell'ultima pubblicazione. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const contenuti: ContenutiModuleService = req.scope.resolve(CONTENUTI_MODULE)
  const [entries, publication] = await Promise.all([contenuti.listEntries(), contenuti.latestPublication()])
  res.json({
    entries,
    pending: pendingCount(entries),
    publication,
    // Senza comando di generazione (sviluppo) "Pubblica" aggiorna solo il file della vetrina.
    rebuilds: Boolean(publisherConfig().command),
    // Le foto di partenza stanno nella vetrina (/images/...): servono per le anteprime.
    storefront: storefront(),
  })
}
