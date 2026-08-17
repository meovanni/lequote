import { Nav } from '@/components/layout/Nav/Nav'
import { Footer } from '@/components/layout/Footer/Footer'
import { Hero } from '@/components/sections/Hero/Hero'
import { ChiSiamo } from '@/components/sections/ChiSiamo/ChiSiamo'
import { Territorio } from '@/components/sections/Territorio/Territorio'
import { Olio } from '@/components/sections/Olio/Olio'
import { Miele } from '@/components/sections/Miele/Miele'
import { Contatti } from '@/components/sections/Contatti/Contatti'
import { Shop } from '@/components/sections/Shop/Shop'

function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ChiSiamo />
        <Territorio />
        <Olio />
        <Miele />
        <Contatti />
        <Shop />
      </main>
      <Footer />
    </>
  )
}

export default App
