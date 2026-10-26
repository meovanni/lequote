import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Shop } from './Shop'

vi.mock('@/cart/CartContext', () => ({
  useCart: () => ({ cart: null, busy: false, error: null, addItem: vi.fn(), setQuantity: vi.fn() }),
}))

// Olio: la bottiglia si ordina, la latta è esaurita. Miele: nessun formato in vendita.
vi.mock('@/hooks/useCatalogProduct', () => ({
  useCatalogProduct: (handle: string) => ({
    status: 'ready',
    product:
      handle === 'olio-extravergine'
        ? {
            id: 'p1',
            handle,
            variants: [
              { id: 'v1', sku: 'OLIO-750ML', title: '750', price: 15, stock: null, purchasable: true },
              { id: 'v2', sku: 'OLIO-5L', title: '5L', price: 75, stock: 0, purchasable: false },
            ],
          }
        : null,
  }),
}))

describe('Shop', () => {
  it('mostra l’immagine di ogni formato e segna quelli non disponibili', () => {
    render(
      <MemoryRouter>
        <Shop />
      </MemoryRouter>,
    )
    // Latta esaurita e i due vasetti non in vendita: tre formati spenti, la bottiglia no.
    expect(screen.getAllByText('Non disponibile')).toHaveLength(3)
    expect(screen.getByRole('img', { name: /5 litri/i }).closest('[data-unavailable]')).toHaveAttribute('data-unavailable', 'true')
    expect(screen.getByRole('img', { name: /750 ml/i }).closest('[data-unavailable]')).toHaveAttribute('data-unavailable', 'false')
    expect(screen.queryByText('Foto in arrivo')).toBeNull()
  })
})
