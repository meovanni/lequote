import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { availability } from '../../../lib/magazzino'
import { FORMATS } from '../../../modules/magazzino/lib/formats'

// Pezzi ordinabili dal sito per ogni formato confezionato (lib/magazzino.ts): pronti liberi più
// quelli che si confezionano dallo sfuso libero. Lo sfuso in litri e chili non si vende dal sito.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const available = await availability(req.scope)
  res.setHeader('Cache-Control', 'no-store')
  res.json({ available: Object.fromEntries(FORMATS.filter((format) => !format.bulk).map((format) => [format.sku, available[format.sku] ?? 0])) })
}
