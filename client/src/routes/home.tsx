import { Hero } from '@/components/sections/Hero/Hero'
import { ChiSiamo } from '@/components/sections/ChiSiamo/ChiSiamo'
import { Territorio } from '@/components/sections/Territorio/Territorio'
import { Olio } from '@/components/sections/Olio/Olio'
import { Miele } from '@/components/sections/Miele/Miele'
import { Filiera } from '@/components/sections/Filiera/Filiera'
import { Stagioni } from '@/components/sections/Stagioni/Stagioni'
import { Shop } from '@/components/sections/Shop/Shop'
import { Domande } from '@/components/sections/Domande/Domande'
import { contentByLocale } from '@/data/content'
import { localeFromPathname } from '@/i18n/locales'
import { pageMeta } from '@/i18n/seo'
import type { Route } from './+types/home'

export function meta({ location }: Route.MetaArgs) {
  const locale = localeFromPathname(location.pathname)
  const { title, description } = contentByLocale[locale].meta
  return pageMeta({ locale, path: '/', title, description })
}

// Ordine e superfici seguono il ritmo chiaro/bosco di DESIGN.md: mai due fasce bosco vicine.
export default function Home() {
  return (
    <>
      <Hero />
      <ChiSiamo />
      <Territorio />
      <Olio />
      <Miele />
      <Filiera />
      <Stagioni />
      <Shop />
      <Domande />
    </>
  )
}
