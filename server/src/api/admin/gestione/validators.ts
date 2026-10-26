import { z } from '@medusajs/framework/zod'
import { FORMATS } from '../../../modules/magazzino/lib/formats'

// Modifiche in riga della pagina Gestione. Le quantità di sfuso arrivano in litri o chili (anche
// con decimali), quelle dei formati in pezzi.
const sku = z.enum(FORMATS.map((format) => format.sku) as [string, ...string[]])

export const StockSet = z.object({ sku, quantity: z.number().min(0).max(1_000_000) }).strict()
export const PackCreate = z.object({ sku, pieces: z.number().int().min(1).max(100_000) }).strict()
export const PriceSet = z.object({ sku, price: z.number().min(0).max(100_000) }).strict()
