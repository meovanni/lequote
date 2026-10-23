import { readSheet } from 'read-excel-file/universal'
import type { ImportRow } from '../../lib/order-import'
import { sdk } from './sdk'

const MAX_FILE_BYTES = 5 * 1024 * 1024
/** Righe per richiesta: il server crea gli ordini uno alla volta, così si vede l'avanzamento. */
const BATCH = 20

/** Il primo foglio di un file .xlsx, come righe di celle. */
export async function readFirstSheet(file: File): Promise<unknown[][]> {
  if (!/\.xlsx$/i.test(file.name)) throw new Error('Serve un file Excel .xlsx (da Excel: Salva con nome › Cartella di lavoro di Excel).')
  if (file.size > MAX_FILE_BYTES) throw new Error('Il file supera 5 MB.')
  return (await readSheet(file)) as unknown[][]
}

export type ImportSettings = { variantId: string; shippingOptionId: string | null; agentId: string | null; fileName: string }
export type ImportOutcome = { line: number; ok: boolean; order_id?: string; error?: string }

/** Manda le righe valide a gruppi; onProgress riceve quante righe sono state elaborate. */
export async function sendImport(rows: ImportRow[], settings: ImportSettings, onProgress: (done: number) => void): Promise<ImportOutcome[]> {
  const outcomes: ImportOutcome[] = []
  for (let start = 0; start < rows.length; start += BATCH) {
    const batch = rows.slice(start, start + BATCH)
    const { results } = await sdk.client.fetch<{ results: ImportOutcome[] }>('/admin/backoffice/order-imports', {
      method: 'POST',
      body: {
        variant_id: settings.variantId,
        ...(settings.shippingOptionId ? { shipping_option_id: settings.shippingOptionId } : {}),
        ...(settings.agentId ? { agent_id: settings.agentId } : {}),
        file_name: settings.fileName,
        // Senza importo nel file il server applica il listino: si manda solo l'importo del file.
        rows: batch.map(({ line, name, tanks, amount, amountFromFile }) => ({ line, name, tanks, ...(amountFromFile ? { amount } : {}) })),
      },
    })
    outcomes.push(...results)
    onProgress(outcomes.length)
  }
  return outcomes
}
