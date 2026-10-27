import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'
import { updatePricing } from '../lib/pricing'
import { LINES } from '../modules/magazzino/lib/formats'

// Listino al litro e al chilo (2026-10-27, lib/pricing.ts) sui database esistenti: i prezzi dei
// formati si ricalcolano dal prezzo della riga sfusa, senza supplemento confezione. Su un database
// nuovo il seed nasce già così.
export default async function pricePerVolume({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  for (const line of LINES) {
    try {
      const pricing = await updatePricing(container, line, {})
      logger.info(`Listino ${line}: ${pricing.unitPrice} € al ${line === 'olio' ? 'litro' : 'chilo'}, formati ricalcolati.`)
    } catch (error) {
      // Solo la riga sfusa mancante (database nuovo, prima del seed) non è un errore.
      if (!(error instanceof MedusaError && error.type === MedusaError.Types.NOT_FOUND)) throw error
      logger.info(`Listino ${line}: nessuna riga sfusa (database nuovo), ci pensa il seed.`)
    }
  }
}
