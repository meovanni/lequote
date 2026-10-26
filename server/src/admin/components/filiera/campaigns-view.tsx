import { ChevronDownMini } from '@medusajs/icons'
import { Button, Checkbox, Input, Text, clx, usePrompt } from '@medusajs/ui'
import { Fragment, useState, type FormEvent } from 'react'
import {
  formatDate,
  LINE_LABEL,
  suppliersFor,
  toDateInput,
  useCampaign,
  useCampaigns,
  useFilieraAction,
  useRegistry,
  useSuppliers,
  type Campaign,
  type ProductLine,
} from '../../lib/filiera-api'
import { InlineSelect, InlineText, Labeled } from '../inline/inline-fields'
import { AnalysesPanel } from './analyses-panel'

// Campagne di raccolta (olio) e di produzione (miele): una riga ciascuna, aperta sul posto con
// periodo, frantoio, provenienza e analisi. Ogni dato si salva appena cambiato.

function NewCampaignRow() {
  const action = useFilieraAction()
  const [line, setLine] = useState<ProductLine>('olio')
  const [label, setLabel] = useState('')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    action.mutate({ path: '/admin/filiera/campaigns', body: { product_line: line, label: label.trim() }, success: 'Campagna creata.' }, { onSuccess: () => setLabel('') })
  }
  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 border-t border-ui-border-base bg-ui-bg-subtle px-6 py-3">
      <Text size="small" weight="plus" className="mr-2">Nuova campagna</Text>
      <select aria-label="Linea" value={line} onChange={(event) => setLine(event.target.value as ProductLine)} className="txt-compact-small rounded-md border border-ui-border-base bg-ui-bg-field px-2 py-1.5">
        <option value="olio">Olio</option>
        <option value="miele">Miele</option>
      </select>
      <Input size="small" aria-label="Nome della campagna" placeholder="Nome, es. 2026/27" value={label} onChange={(event) => setLabel(event.target.value)} className="w-48" />
      <Button size="small" type="submit" disabled={!label.trim()} isLoading={action.isPending}>
        Crea
      </Button>
    </form>
  )
}

function CampaignFields({ campaign }: { campaign: Campaign }) {
  const action = useFilieraAction()
  const prompt = usePrompt()
  const isOil = campaign.product_line === 'olio'
  const suppliers = useSuppliers()
  const mills = suppliersFor(suppliers.data?.items ?? [], ['frantoio'])
  const sources = useRegistry(isOil ? 'groves' : 'apiaries')
  const selected = ((isOil ? campaign.groves : campaign.apiaries) ?? []).map((item) => item.id)
  const save = (body: Record<string, unknown>) => action.mutate({ path: `/admin/filiera/campaigns/${campaign.id}`, body, success: 'Salvato.' })
  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]
    save(isOil ? { grove_ids: next } : { apiary_ids: next })
  }
  const lots = campaign.lots ?? []

  const remove = async () => {
    const confirmed = await prompt({
      title: `Eliminare la campagna ${campaign.label}?`,
      description: 'Si eliminano anche le sue analisi. Una campagna con lotti non si elimina.',
      confirmText: 'Elimina',
      cancelText: 'Annulla',
    })
    if (confirmed) action.mutate({ path: `/admin/filiera/campaigns/${campaign.id}`, method: 'DELETE', success: 'Campagna eliminata.' })
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2 xl:grid-cols-4">
      <Labeled label="Nome">
        <InlineText value={campaign.label} label="Nome della campagna" required onSave={(value) => save({ label: value })} />
      </Labeled>
      <Labeled label={isOil ? 'Inizio raccolta' : 'Inizio produzione'}>
        <InlineText type="date" value={toDateInput(campaign.harvest_start)} label="Inizio" onSave={(value) => save({ harvest_start: value })} />
      </Labeled>
      <Labeled label={isOil ? 'Fine raccolta' : 'Fine produzione'}>
        <InlineText type="date" value={toDateInput(campaign.harvest_end)} label="Fine" onSave={(value) => save({ harvest_end: value })} />
      </Labeled>
      {isOil ? (
        <Labeled label="Frantoio">
          <InlineSelect
            value={campaign.mill?.id ?? null}
            label="Frantoio della campagna"
            emptyLabel="Non ancora scelto"
            options={mills.map((mill) => ({ value: mill.id, label: `${mill.name}, ${mill.municipality}` }))}
            onSave={(value) => save({ mill_id: value })}
          />
        </Labeled>
      ) : (
        <div />
      )}
      <Labeled label={isOil ? 'Oliveti' : 'Apiari'}>
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-2 py-1">
          {(sources.data?.items ?? []).length === 0 && <Text size="small" className="text-ui-fg-muted">Nessuno: aggiungili in «Oliveti e apiari».</Text>}
          {(sources.data?.items ?? []).map((item) => (
            <label key={item.id} className="txt-compact-small flex items-center gap-2">
              <Checkbox checked={selected.includes(item.id)} onCheckedChange={() => toggle(item.id)} />
              {item.name}
            </label>
          ))}
        </div>
      </Labeled>
      <Labeled label="Note interne">
        <InlineText multiline value={campaign.notes} label="Note interne" onSave={(value) => save({ notes: value })} />
      </Labeled>
      <Labeled label="Lotti">
        <Text size="small" className="px-2 py-1 text-ui-fg-subtle">
          {lots.length === 0 ? 'Nessuno' : lots.map((lot) => lot.code).join(', ')}
        </Text>
      </Labeled>
      <div className="flex items-end justify-end">
        {lots.length === 0 && (
          <Button size="small" variant="transparent" className="text-ui-fg-error" onClick={() => void remove()}>
            Elimina campagna
          </Button>
        )}
      </div>
    </div>
  )
}

function CampaignDetail({ id }: { id: string }) {
  const detail = useCampaign(id)
  if (!detail.data) return <div className="m-4 h-32 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />
  const { campaign } = detail.data
  return (
    <div className="flex flex-col gap-4 bg-ui-bg-subtle px-6 py-4">
      <CampaignFields campaign={campaign} />
      <AnalysesPanel campaign={campaign} />
    </div>
  )
}

export function CampaignsView() {
  const campaigns = useCampaigns()
  const [openId, setOpenId] = useState<string | null>(null)
  const list = campaigns.data?.campaigns ?? []

  return (
    <div className="flex flex-col">
      <NewCampaignRow />
      {campaigns.isLoading && <div className="m-6 h-24 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />}
      {campaigns.data && list.length === 0 && (
        <Text size="small" className="border-t border-ui-border-base px-6 py-8 text-center text-ui-fg-subtle">Nessuna campagna.</Text>
      )}
      {list.length > 0 && (
        <table className="w-full">
          <thead>
            <tr className="txt-compact-xsmall-plus border-t border-ui-border-base text-ui-fg-muted">
              <th className="px-6 py-2 text-left font-normal">Campagna</th>
              <th className="py-2 text-left font-normal">Linea</th>
              <th className="py-2 text-left font-normal">Periodo</th>
              <th className="px-6 py-2 text-left font-normal">Frantoio e provenienza</th>
            </tr>
          </thead>
          <tbody className="txt-compact-small">
            {list.map((campaign) => {
              const open = openId === campaign.id
              const sources = (campaign.product_line === 'olio' ? campaign.groves : campaign.apiaries) ?? []
              return (
                <Fragment key={campaign.id}>
                  <tr className={clx('border-t border-ui-border-base', open && 'bg-ui-bg-subtle')}>
                    <td className="px-6 py-2">
                      <button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : campaign.id)} className="flex items-center gap-1 text-ui-fg-interactive hover:text-ui-fg-interactive-hover">
                        <ChevronDownMini className={clx('transition-transform', open && 'rotate-180')} />
                        {campaign.label}
                      </button>
                    </td>
                    <td className="py-2">{LINE_LABEL[campaign.product_line]}</td>
                    <td className="py-2 text-ui-fg-subtle">
                      {campaign.harvest_start || campaign.harvest_end ? `${formatDate(campaign.harvest_start)} - ${formatDate(campaign.harvest_end)}` : '-'}
                    </td>
                    <td className="px-6 py-2 text-ui-fg-subtle">{[campaign.mill?.name, ...sources.map((item) => item.name)].filter(Boolean).join(', ') || '-'}</td>
                  </tr>
                  {open && (
                    <tr>
                      <td colSpan={4} className="p-0">
                        <CampaignDetail id={campaign.id} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
