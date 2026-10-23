import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { consolidateStock } from '../lib/stock-pool'

// Un solo magazzino per la merce vendibile (2026-10-23, lib/stock-pool-rules.ts): sui database
// esistenti la merce libera delle altre sedi passa al magazzino principale.
export default async function stockPool({ container }: ExecArgs) {
  const moved = await consolidateStock(container)
  container.resolve(ContainerRegistrationKeys.LOGGER).info(`Giacenze riunite nel magazzino principale: ${moved} pezzi spostati.`)
}
