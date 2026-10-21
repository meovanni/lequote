import type { Content } from '@/data/content'
import type { CartLine } from '@/lib/medusa/cart'

// Nome e formato di una riga nella lingua della pagina; i titoli di Medusa (in italiano) solo se
// il prodotto non è tra quelli descritti nei contenuti.
export function lineLabel(content: Content, line: CartLine): { name: string; format: string } {
  const page = (content.products as Record<string, Content['products'][keyof Content['products']] | undefined>)[
    line.productHandle
  ]
  return {
    name: page?.name ?? line.title,
    format: page?.variantLabels[line.sku] ?? line.subtitle,
  }
}
