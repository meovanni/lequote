import { contentByLocale } from '@/data/content'
import { localeFromPathname } from '@/i18n/locales'
import { privatePageMeta } from '@/i18n/seo'
import { OrderConfirmation } from '@/components/order/OrderConfirmation'
import type { Route } from './+types/order'

export function meta({ location }: Route.MetaArgs) {
  const { orderUi } = contentByLocale[localeFromPathname(location.pathname)]
  return privatePageMeta(`${orderUi.title} | Le Quote`, orderUi.metaDescription)
}

export default function OrderRoute() {
  return <OrderConfirmation />
}
