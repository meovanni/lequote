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

const CampaignsPage = () => {
  const campaigns = useCampaigns()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = useCampaign(selectedId)

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[18rem_1fr]">
      <Container className="divide-y p-0">
        <div className="px-4 py-4">
          <Heading level="h1">Campagne</Heading>
        </div>
        <ul className="flex flex-col py-2">
          {(campaigns.data?.campaigns ?? []).map((campaign) => (
            <li key={campaign.id}>
              <button
                type="button"
                onClick={() => setSelectedId(campaign.id)}
                className={clx(
                  'w-full px-4 py-2 text-left txt-compact-small hover:bg-ui-bg-base-hover',
                  selectedId === campaign.id && 'bg-ui-bg-base-pressed',
                )}
              >
                {LINE_LABEL[campaign.product_line]} {campaign.label}
              </button>
            </li>
          ))}
        </ul>
        <NewCampaign onCreated={setSelectedId} />
      </Container>

      {selected.data ? (
        <CampaignEditor key={selected.data.campaign.id + selected.dataUpdatedAt} campaign={selected.data.campaign} />
      ) : (
        <Container>
          <Text className="text-ui-fg-subtle">Scegli una campagna per modificarla o aggiungere le analisi.</Text>
        </Container>
      )}
    </div>
  )
}

export const config = defineRouteConfig({ label: 'Campagne' })

export default CampaignsPage
