import type { Logger } from '@medusajs/framework/types'
import type ContenutiModuleService from '../service'
import { publishToStorefront, publisherConfig, type PublisherConfig } from './publisher'

/**
 * Avvia la pubblicazione e restituisce subito: la generazione del sito può durare un minuto, il
 * back office ne segue lo stato. L'esito finisce sulla pubblicazione (fatta o fallita, con il motivo).
 */
export async function startPublication(
  service: ContenutiModuleService,
  logger: Logger,
  config: PublisherConfig = publisherConfig(),
) {
  const { publication, snapshot, content } = await service.startPublication()
  const done = (async () => {
    try {
      await publishToStorefront(content, config)
      await service.completePublication(publication.id, snapshot)
      logger.info(`Contenuti pubblicati (modifiche: ${publication.changes}).`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logger.error(`Pubblicazione dei contenuti non riuscita: ${message}`)
      await service.failPublication(publication.id, message).catch(() => undefined)
    }
  })()
  return { publication, done }
}
