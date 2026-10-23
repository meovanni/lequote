import type { Variant } from '../../lib/sales-api'

/**
 * Massimo ordinabile di un formato (la disponibilità totale), più i pezzi che l'ordine tiene già
 * in una modifica. null = giacenza non gestita, nessun limite.
 */
export function maxFor(variant: Pick<Variant, 'available'>, held = 0): number | null {
  return variant.available === null ? null : variant.available + held
}

/** "disponibili 50" oppure "esaurito"; vuoto se la giacenza non è gestita. */
export function stockLabel(variant: Pick<Variant, 'available'>, held = 0): string {
  const max = maxFor(variant, held)
  if (max === null) return ''
  return max <= 0 ? 'esaurito' : `disponibili ${max}`
}
