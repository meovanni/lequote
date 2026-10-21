import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes'

// Le stesse pagine in ogni lingua (ADR 0003): italiano alla radice, inglese e tedesco sotto un
// prefisso, con gli stessi percorsi dopo il prefisso. Ogni copia ha id propri; la lingua si
// ricava dal percorso (i18n/locales.ts).
const pages = (locale: string) =>
  layout('routes/locale.tsx', { id: `locale-${locale}` }, [
    index('routes/home.tsx', { id: `home-${locale}` }),
    route('prodotti/:handle', 'routes/product.tsx', { id: `product-${locale}` }),
    route('carrello', 'routes/cart.tsx', { id: `cart-${locale}` }),
    route('ordine', 'routes/order.tsx', { id: `order-${locale}` }),
  ])

export default [
  pages('it'),
  ...prefix('en', [pages('en')]),
  ...prefix('de', [pages('de')]),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
