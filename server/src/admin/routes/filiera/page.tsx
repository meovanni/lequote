import { defineRouteConfig } from '@medusajs/admin-sdk'
import { ListTree } from '@medusajs/icons'
import { Container, Heading, Text } from '@medusajs/ui'
import { useSearchParams } from 'react-router-dom'
import { CampaignsView } from '../../components/filiera/campaigns-view'
import { LotsView } from '../../components/filiera/lots-view'
import { PlacesView } from '../../components/filiera/places-view'
import { SuppliersView } from '../../components/filiera/suppliers-view'
import { Segmented } from '../../components/inline/inline-fields'

type View = 'lotti' | 'campagne' | 'luoghi' | 'fornitori'

const VIEWS: { value: View; label: string; intro: string }[] = [
  { value: 'lotti', label: 'Lotti', intro: 'Apri un lotto per completarne i dati: si salvano da soli. Diventa pubblico quando i dati di etichetta sono completi.' },
  { value: 'campagne', label: 'Campagne', intro: 'Una campagna per annata: periodo, frantoio, provenienza e analisi valgono per tutti i suoi lotti.' },
  { value: 'luoghi', label: 'Oliveti e apiari', intro: 'Si inseriscono una volta e si scelgono nelle campagne. Clicca su un dato per correggerlo.' },
  { value: 'fornitori', label: 'Fornitori', intro: 'Frantoi, imbottigliamento, laboratori, packaging. Un fornitore può avere più tipologie.' },
]

// Tutta la filiera in una pagina: lotti, campagne, oliveti e apiari, fornitori. Si passa da una
// vista all'altra con i pulsanti in alto; ogni voce si apre e si modifica sul posto.
const FilieraPage = () => {
  const [params, setParams] = useSearchParams()
  const view = (VIEWS.find((entry) => entry.value === params.get('vista'))?.value ?? 'lotti') as View
  const current = VIEWS.find((entry) => entry.value === view)!

  return (
    <Container className="p-0">
      <div className="flex flex-col gap-3 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Heading level="h1">Filiera</Heading>
          <Segmented label="Vista" value={view} options={VIEWS} onChange={(next) => setParams(next === 'lotti' ? {} : { vista: next }, { replace: true })} />
        </div>
        <Text size="small" className="text-ui-fg-subtle">{current.intro}</Text>
      </div>
      {view === 'lotti' && <LotsView initialOpenId={params.get('lotto')} />}
      {view === 'campagne' && <CampaignsView />}
      {view === 'luoghi' && <PlacesView />}
      {view === 'fornitori' && <SuppliersView />}
    </Container>
  )
}

export const config = defineRouteConfig({ label: 'Filiera', icon: ListTree, rank: 2 })

export default FilieraPage
