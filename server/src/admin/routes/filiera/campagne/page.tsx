import { defineRouteConfig } from '@medusajs/admin-sdk'
import { Button, Container, Heading, Input, Select, Text, clx } from '@medusajs/ui'
import { useState, type FormEvent } from 'react'
import { CampaignEditor } from '../../../components/filiera/campaign-editor'
import { LINE_LABEL, useCampaign, useCampaigns, useFilieraAction, type Campaign, type ProductLine } from '../../../lib/filiera-api'

function NewCampaign({ onCreated }: { onCreated: (id: string) => void }) {
  const action = useFilieraAction()
  const [line, setLine] = useState<ProductLine>('olio')
  const [label, setLabel] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    action.mutate(
      { path: '/admin/filiera/campaigns', body: { product_line: line, label: label.trim() }, success: 'Campagna creata.' },
      { onSuccess: (data) => { setLabel(''); onCreated((data.campaign as Campaign).id) } },
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 px-4 py-4">
      <Text size="small" weight="plus">Nuova campagna</Text>
      <Select size="small" value={line} onValueChange={(value) => setLine(value as ProductLine)}>
        <Select.Trigger aria-label="Linea">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="olio">Olio</Select.Item>
          <Select.Item value="miele">Miele</Select.Item>
        </Select.Content>
      </Select>
      <Input size="small" aria-label="Nome della campagna" placeholder="2025/26" value={label} onChange={(e) => setLabel(e.target.value)} />
      <Button size="small" type="submit" isLoading={action.isPending} disabled={!label.trim()}>
        Crea
      </Button>
    </form>
  )
}

const LINES: ProductLine[] = ['olio', 'miele']

/** Campagne raggruppate per linea a sinistra, la campagna scelta (all'inizio la prima dell'elenco) a destra. */
const CampaignsPage = () => {
  const campaigns = useCampaigns()
  const [chosenId, setChosenId] = useState<string | null>(null)
  const list = campaigns.data?.campaigns ?? []
  const selectedId = chosenId ?? list[0]?.id ?? null
  const selected = useCampaign(selectedId)

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[18rem_1fr]">
      <Container className="divide-y p-0 lg:self-start">
        <div className="px-4 py-4">
          <Heading level="h1">Campagne</Heading>
        </div>
        {campaigns.isLoading && <div className="m-4 h-20 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />}
        {LINES.filter((line) => list.some((campaign) => campaign.product_line === line)).map((line) => (
          <div key={line} className="flex flex-col py-2">
            <Text size="xsmall" weight="plus" className="px-4 pb-1 pt-2 text-ui-fg-muted">
              {LINE_LABEL[line]}
            </Text>
            <ul className="flex flex-col">
              {list
                .filter((campaign) => campaign.product_line === line)
                .map((campaign) => (
                  <li key={campaign.id}>
                    <button
                      type="button"
                      aria-current={selectedId === campaign.id ? 'true' : undefined}
                      onClick={() => setChosenId(campaign.id)}
                      className={clx(
                        'txt-compact-small w-full border-l-2 px-4 py-2 text-left hover:bg-ui-bg-base-hover',
                        selectedId === campaign.id ? 'border-ui-border-interactive bg-ui-bg-highlight text-ui-fg-base' : 'border-transparent text-ui-fg-subtle',
                      )}
                    >
                      Campagna {campaign.label}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
        <NewCampaign onCreated={setChosenId} />
      </Container>

      {selected.data ? (
        <CampaignEditor key={selected.data.campaign.id + selected.dataUpdatedAt} campaign={selected.data.campaign} />
      ) : (
        <Container className="flex min-h-48 items-center justify-center px-6 py-10">
          <Text size="small" className="text-center text-ui-fg-subtle">
            {campaigns.isLoading || selected.isLoading ? 'Caricamento…' : 'Nessuna campagna. Creane una a sinistra: poi si aggiungono frantoio e analisi.'}
          </Text>
        </Container>
      )}
    </div>
  )
}

export const config = defineRouteConfig({ label: 'Campagne' })

export default CampaignsPage
