import { contentByLocale } from '@/data/content'
import { PRODUCT_HANDLES, type ProductHandle } from '@/data/content/handles'
import { localeFromPathname } from '@/i18n/locales'
import { pageMeta } from '@/i18n/seo'
import { ProductDetail } from '@/components/product/ProductDetail'
import { ErrorPage } from '@/components/common/ErrorPage/ErrorPage'
import type { Route } from './+types/product'

function isProductHandle(value: string | undefined): value is ProductHandle {
  return (PRODUCT_HANDLES as readonly string[]).includes(value ?? '')
}

export function meta({ location, params }: Route.MetaArgs) {
  if (!isProductHandle(params.handle)) return []
  const locale = localeFromPathname(location.pathname)
  const page = contentByLocale[locale].products[params.handle]
  return pageMeta({
    locale,
    path: `/prodotti/${params.handle}`,
    title: `${page.name} | Le Quote`,
    description: page.metaDescription,
  })
}

export default function ProductRoute({ params }: Route.ComponentProps) {
  // Le schede esistenti sono tutte prerenderizzate: un handle sconosciuto arriva qui solo dal
  // fallback del sito statico, e mostra la pagina 404.
  if (!isProductHandle(params.handle)) return <ErrorPage notFound />
  return <ProductDetail handle={params.handle} />
}
