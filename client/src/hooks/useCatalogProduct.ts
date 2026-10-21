import { useEffect, useState } from 'react'
import { getProduct, type CatalogProduct } from '@/lib/medusa/catalog'

export type CatalogState =
  | { status: 'loading' }
  | { status: 'ready'; product: CatalogProduct | null }
  | { status: 'error' }

// Prezzi e disponibilità si leggono a ogni visita, nel browser: la pagina statica ha già testi e
// immagini, questi dati cambiano senza rifare il build.
export function useCatalogProduct(handle: string): CatalogState {
  const [state, setState] = useState<CatalogState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    getProduct(handle)
      .then((product) => {
        if (!cancelled) setState({ status: 'ready', product })
      })
      .catch((error: unknown) => {
        console.error(error)
        if (!cancelled) setState({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [handle])

  return state
}
