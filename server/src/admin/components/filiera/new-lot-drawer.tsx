import { Button, Drawer, Input, Select, Text } from '@medusajs/ui'
import { useState, type FormEvent } from 'react'
import { FormField } from '../form-field'
import { useCampaigns, useFilieraAction, type Lot, type ProductLine } from '../../lib/filiera-api'

type NewLotDrawerProps = { onCreated: (id: string) => void }

const DEFAULT_NAME: Record<ProductLine, string> = {
  olio: 'Olio extravergine di oliva',
  miele: 'Miele',
}

export function NewLotDrawer({ onCreated }: NewLotDrawerProps) {
  const [open, setOpen] = useState(false)
  const [line, setLine] = useState<ProductLine>('olio')
  const [code, setCode] = useState('')
  const [name, setName] = useState(DEFAULT_NAME.olio)
  const [campaignId, setCampaignId] = useState('')
  const campaigns = useCampaigns(line)
  const action = useFilieraAction()

  const changeLine = (value: string) => {
    const next = value as ProductLine
    setLine(next)
    setName(DEFAULT_NAME[next])
    setCampaignId('')
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    action.mutate(
      {
        path: '/admin/filiera/lots',
        body: { code, product_line: line, product_name: name, campaign_id: campaignId },
        success: 'Lotto creato in bozza.',
      },
      {
        onSuccess: (data) => {
          setOpen(false)
          setCode('')
          onCreated((data.lot as Lot).id)
        },
      },
    )
  }

  const noCampaigns = campaigns.data && campaigns.data.campaigns.length === 0

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button size="small">Nuovo lotto</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <form onSubmit={submit} className="flex h-full flex-col">
          <Drawer.Header>
            <Drawer.Title>Nuovo lotto</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-y-4">
            <FormField id="lot-line" label="Linea">
              <Select value={line} onValueChange={changeLine}>
                <Select.Trigger id="lot-line">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="olio">Olio</Select.Item>
                  <Select.Item value="miele">Miele</Select.Item>
                </Select.Content>
              </Select>
            </FormField>
            <FormField id="lot-code" label="Codice lotto" hint="Come stampato in etichetta, per esempio L2026-01.">
              <Input id="lot-code" value={code} onChange={(event) => setCode(event.target.value)} />
            </FormField>
            <FormField id="lot-name" label="Denominazione di vendita">
              <Input id="lot-name" value={name} onChange={(event) => setName(event.target.value)} required />
            </FormField>
            <FormField id="lot-campaign" label="Campagna">
              <Select value={campaignId} onValueChange={setCampaignId}>
                <Select.Trigger id="lot-campaign">
                  <Select.Value placeholder="Scegli la campagna" />
                </Select.Trigger>
                <Select.Content>
                  {(campaigns.data?.campaigns ?? []).map((campaign) => (
                    <Select.Item key={campaign.id} value={campaign.id}>
                      {campaign.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </FormField>
            {noCampaigns && (
              <Text size="small" className="text-ui-fg-subtle">
                Nessuna campagna per questa linea: creala prima in Filiera › Campagne.
              </Text>
            )}
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button variant="secondary" size="small" type="button">
                Annulla
              </Button>
            </Drawer.Close>
            <Button size="small" type="submit" isLoading={action.isPending} disabled={!campaignId || !code.trim()}>
              Crea in bozza
            </Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}
