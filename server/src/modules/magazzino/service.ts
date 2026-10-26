import type { Context } from '@medusajs/framework/types'
import { InjectTransactionManager, MedusaContext, MedusaError, MedusaService } from '@medusajs/framework/utils'
import { FORMATS, formatOf } from './lib/formats'
import type { Counts, Movement } from './lib/stock'
import { StockCount, StockMovement } from './models/stock'

type MovementKind = 'rettifica' | 'confezionamento' | 'consegna' | 'annullo_consegna'
export type MovementMeta = { kind: MovementKind; order_id?: string | null; actor_name?: string | null; note?: string | null }

class MagazzinoModuleService extends MedusaService({ StockCount, StockMovement }) {
  /** Quantità di ogni SKU noto; quelli mai caricati valgono zero. */
  async currentCounts(): Promise<Counts> {
    const rows = await this.listStockCounts({})
    const counts: Counts = Object.fromEntries(FORMATS.map((format) => [format.sku, 0]))
    for (const row of rows) counts[row.sku] = Number(row.quantity)
    return counts
  }

  /** Applica variazioni e le registra, tutto o niente. Nessuna quantità può scendere sotto zero. */
  @InjectTransactionManager()
  async applyMovements(movements: Movement[], meta: MovementMeta, @MedusaContext() context: Context = {}): Promise<Counts> {
    const rows = await this.listStockCounts({ sku: movements.map((movement) => movement.sku) }, {}, context)
    for (const movement of movements) {
      if (!formatOf(movement.sku)) throw new MedusaError(MedusaError.Types.INVALID_DATA, `Formato sconosciuto: ${movement.sku}.`)
      if (movement.delta === 0) continue
      const row = rows.find((entry) => entry.sku === movement.sku)
      const next = Number(row?.quantity ?? 0) + movement.delta
      if (next < 0) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, `Non c'è abbastanza ${formatOf(movement.sku)!.label.toLowerCase()} in magazzino.`)
      if (row) await this.updateStockCounts({ id: row.id, quantity: next }, context)
      else await this.createStockCounts({ sku: movement.sku, quantity: next }, context)
      await this.createStockMovements({ sku: movement.sku, delta: movement.delta, ...meta }, context)
    }
    return this.currentCounts()
  }

  /** Rettifica a mano: porta uno SKU alla quantità contata. */
  async setCount(sku: string, quantity: number, actor: string | null): Promise<Counts> {
    const counts = await this.currentCounts()
    return this.applyMovements([{ sku, delta: quantity - (counts[sku] ?? 0) }], { kind: 'rettifica', actor_name: actor })
  }
}

export default MagazzinoModuleService
