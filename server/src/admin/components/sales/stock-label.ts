import type { Variant } from '../../lib/sales-api'

/**
 * Massimo ordinabile di un formato, più i pezzi che l'ordine tiene già (in una modifica).
 * null = giacenza non gestita, nessun limite.
 */
export function maxFor(variant: Pick<Variant, 'available'>, held = 0): number | null {
  return variant.available === null ? null : variant.available + held
}

/** "disponibili 50", "esaurito", con la somma delle sedi quando è più alta del massimo per ordine. */
export function stockLabel(variant: Pick<Variant, 'available' | 'stock'>, held = 0): string {
  const max = maxFor(variant, held)
  if (max === null) return ''
  if (max <= 0) return 'esaurito'
  const total = (variant.stock ?? 0) + held
  return total > max ? `disponibili ${max} per ordine (${total} tra le sedi)` : `disponibili ${max}`
}
