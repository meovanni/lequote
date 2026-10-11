import { Nav } from '@/components/layout/Nav/Nav'
import { Footer } from '@/components/layout/Footer/Footer'
import { Hero } from '@/components/sections/Hero/Hero'
import { ChiSiamo } from '@/components/sections/ChiSiamo/ChiSiamo'
import { Territorio } from '@/components/sections/Territorio/Territorio'
import { Olio } from '@/components/sections/Olio/Olio'
import { Miele } from '@/components/sections/Miele/Miele'
import { Filiera } from '@/components/sections/Filiera/Filiera'
import { Stagioni } from '@/components/sections/Stagioni/Stagioni'
import { Shop } from '@/components/sections/Shop/Shop'
import { Domande } from '@/components/sections/Domande/Domande'

// Ordine e superfici seguono il ritmo chiaro/bosco di DESIGN.md: mai due fasce bosco vicine.
function App() {
  return (
    <>
      <a href="#contenuto" className="skip-link mono-label">
        Salta al contenuto
      </a>
      <Nav />
      <main id="contenuto">
        <Hero />
        <ChiSiamo />
        <Territorio />
        <Olio />
        <Miele />
        <Filiera />
        <Stagioni />
        <Shop />
        <Domande />
      </main>
      <Footer />
    </>
  )
}

export default App
