import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { MAGAZZINO_MODULE } from '../modules/magazzino'
import type MagazzinoModuleService from '../modules/magazzino/service'

// Solo sviluppo e test end-to-end: un magazzino di prova (sfuso e qualche pezzo pronto), così
// carrello e checkout si possono provare. Le quantità vere si scrivono nella pagina Gestione.
const DEV_COUNTS: Record<string, number> = {
  'OLIO-SFUSO': 300_000,
  'OLIO-750ML': 50,
  'OLIO-5L': 20,
  'MIELE-SFUSO': 60_000,
  'MIELE-250G': 50,
  'MIELE-500G': 50,
}

export default async function devStock({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (process.env.NODE_ENV === 'production') {
    throw new Error('dev-stock è solo per lo sviluppo: in produzione le quantità si scrivono nella pagina Gestione.')
  }
  const magazzino: MagazzinoModuleService = container.resolve(MAGAZZINO_MODULE)
  for (const [sku, quantity] of Object.entries(DEV_COUNTS)) await magazzino.setCount(sku, quantity, 'dev-stock')
  logger.info('Magazzino di prova: 300 L d’olio e 60 kg di miele sfusi, più qualche pezzo pronto.')
}
