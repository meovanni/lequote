import { createContext, use } from 'react'
import type { Cart } from '@/lib/medusa/cart'

export interface CartContextValue {
  cart: Cart | null
  /** true finché il carrello salvato non è stato riletto da Medusa. */
  loading: boolean
  /** true durante un'operazione sul carrello: i pulsanti si disattivano. */
  busy: boolean
  /** Ultima operazione fallita; il testo tradotto lo sceglie la vista. */
  error: 'add' | 'update' | null
  addItem: (variantId: string, quantity: number) => Promise<boolean>
  setQuantity: (lineId: string, quantity: number) => Promise<void>
  /** Sostituisce il carrello con la versione aggiornata dal checkout. */
  replace: (cart: Cart) => void
  /** Dopo l'ordine: il carrello completato non si riusa. */
  forget: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const value = use(CartContext)
  if (!value) throw new Error('useCart va usato dentro CartProvider.')
  return value
}
