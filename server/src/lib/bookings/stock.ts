import { MedusaError } from '@medusajs/framework/utils'

/**
 * Errori di giacenza di Medusa (messaggi tecnici in inglese) resi comprensibili. Le giacenze vere
 * sono quelle del magazzino (lib/magazzino.ts): Medusa non le gestisce più, ma un ordine nato prima
 * del cambio può ancora citarle.
 */
export function explainInventoryError(error: unknown): unknown {
  // Gli errori dei workflow di Medusa non sono sempre istanze di Error: conta il messaggio.
  const message = typeof (error as { message?: unknown })?.message === 'string' ? (error as { message: string }).message : ''
  if (/inventory|not enough stock/i.test(message)) {
    return new MedusaError(MedusaError.Types.NOT_ALLOWED, 'La disponibilità è appena cambiata: ricarica la pagina e controlla le quantità.')
  }
  return error
}
