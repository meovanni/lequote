import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { addLine, createCart, removeLine, retrieveCart, updateLine, type Cart } from '@/lib/medusa/cart'
import { useLocale } from '@/i18n/LocaleContext'
import { CartContext, type CartContextValue } from './CartContext'

// Solo l'id del carrello resta nel browser; il contenuto vive in Medusa. Se lo storage non è
// disponibile (navigazione privata, dati bloccati) il carrello dura quanto la pagina.
const STORAGE_KEY = 'lequote.cart'

function readCartId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeCartId(id: string | null) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nessuna persistenza: il carrello resta valido finché la pagina è aperta.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const locale = useLocale()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<CartContextValue['error']>(null)
  // Più clic rapidi su "aggiungi" prima che esista il carrello devono crearne uno solo.
  const pendingCart = useRef<Promise<Cart> | null>(null)

  useEffect(() => {
    const id = readCartId()
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    retrieveCart(id)
      .then((saved) => {
        if (cancelled) return
        if (saved.completed) writeCartId(null)
        else setCart(saved)
      })
      .catch((reason: unknown) => {
        // Carrello scaduto o di un altro database: si riparte da zero.
        console.error(reason)
        writeCartId(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const ensureCart = useCallback(async (): Promise<Cart> => {
    if (cart) return cart
    pendingCart.current ??= createCart(locale).then((created) => {
      writeCartId(created.id)
      setCart(created)
      return created
    })
    try {
      return await pendingCart.current
    } finally {
      pendingCart.current = null
    }
  }, [cart, locale])

  const addItem = useCallback(
    async (variantId: string, quantity: number) => {
      setBusy(true)
      setError(null)
      try {
        const current = await ensureCart()
        setCart(await addLine(current.id, variantId, quantity))
        return true
      } catch (reason) {
        console.error(reason)
        setError('add')
        return false
      } finally {
        setBusy(false)
      }
    },
    [ensureCart],
  )

  const setQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return
      setBusy(true)
      setError(null)
      try {
        setCart(quantity > 0 ? await updateLine(cart.id, lineId, quantity) : await removeLine(cart.id, lineId))
      } catch (reason) {
        console.error(reason)
        setError('update')
      } finally {
        setBusy(false)
      }
    },
    [cart],
  )

  const forget = useCallback(() => {
    writeCartId(null)
    setCart(null)
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      loading,
      busy,
      error,
      addItem,
      setQuantity,
      replace: setCart,
      forget,
    }),
    [cart, loading, busy, error, addItem, setQuantity, forget],
  )

  return <CartContext value={value}>{children}</CartContext>
}
