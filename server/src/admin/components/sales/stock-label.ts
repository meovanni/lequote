import type { Variant } from '../../lib/sales-api'

/**
 * Massimo ordinabile di un formato (la disponibilità totale), più i pezzi che l'ordine tiene già
 * in una modifica. null = giacenza non gestita, nessun limite.
 */
export function maxFor(variant: Pick<Variant, 'available'>, held = 0): number | null {
  return variant.available === null ? null : variant.available + held
}

/** "disponibili 50", "disponibili 120 L" oppure "esaurito"; vuoto se il formato non è a magazzino. */
export function stockLabel(variant: Pick<Variant, 'available'> & Partial<Pick<Variant, 'unit'>>, held = 0): string {
  const max = maxFor(variant, held)
  if (max === null) return ''
  const unit = variant.unit && variant.unit !== 'pz' ? ` ${variant.unit}` : ''
  return max <= 0 ? 'esaurito' : `disponibili ${max}${unit}`
}

/** Prezzo con l'unità per le righe sfuse: "15,00 € al litro". */
export function priceLabel(variant: Pick<Variant, 'price' | 'unit'>, format: (value: number) => string): string {
  if (variant.price === null) return 'Prezzo non impostato'
  return variant.unit === 'L' ? `${format(variant.price)} al litro` : variant.unit === 'kg' ? `${format(variant.price)} al chilo` : format(variant.price)
}
