import { contentByLocale } from '@/data/content'
import { localeFromPathname } from '@/i18n/locales'
import { privatePageMeta } from '@/i18n/seo'
import { CartPage } from '@/components/cart/CartPage'
import type { Route } from './+types/cart'

export function meta({ location }: Route.MetaArgs) {
  const { cartUi } = contentByLocale[localeFromPathname(location.pathname)]
  return privatePageMeta(`${cartUi.title} | Le Quote`, cartUi.metaDescription)
}

export default function CartRoute() {
  return <CartPage />
}
