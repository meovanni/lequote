import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'
import { currentPricing, updatePricing } from '../lib/pricing'
import { formatOf, LINES } from '../modules/magazzino/lib/formats'
import { DEFAULT_SURCHARGE } from '../modules/magazzino/lib/pricing'

// Costo di confezione per pezzo (2026-10-27): i formati piccoli costano di più del solo prodotto
// che contengono. Sui database dove il listino al litro era nato senza supplementi (a zero), si
// mettono quelli di partenza e i prezzi si ricalcolano. Un supplemento già diverso da zero resta.
export default async function packagingSurcharge({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  for (const line of LINES) {
    try {
      const { surcharges } = await currentPricing(container, line)
      const defaults = Object.fromEntries(
        Object.entries(DEFAULT_SURCHARGE).filter(([sku, amount]) => amount > 0 && (surcharges[sku] ?? 0) === 0 && formatOf(sku)?.line === line),
      )
      await updatePricing(container, line, { surcharges: defaults })
      logger.info(`Listino ${line}: costi di confezione di partenza applicati (${Object.keys(defaults).join(', ') || 'nessuno da cambiare'}).`)
    } catch (error) {
      if (!(error instanceof MedusaError && error.type === MedusaError.Types.NOT_FOUND)) throw error
      logger.info(`Listino ${line}: nessuna riga sfusa (database nuovo), ci pensa il seed.`)
    }
  }
}
