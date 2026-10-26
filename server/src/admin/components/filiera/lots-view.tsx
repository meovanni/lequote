import { ChevronDownMini } from '@medusajs/icons'
import { Button, Input, StatusBadge, Text, clx } from '@medusajs/ui'
import { Fragment, useState, type FormEvent } from 'react'
import { formatDate, LINE_LABEL, useCampaigns, useFilieraAction, useLots, type Lot, type ProductLine } from '../../lib/filiera-api'
import { Segmented } from '../inline/inline-fields'
import { LotEditor } from './lot-editor'

const DEFAULT_NAME: Record<ProductLine, string> = { olio: 'Olio extravergine di oliva', miele: 'Miele' }

/** Nuovo lotto in una riga: linea, codice, campagna. Il resto si compila aprendo il lotto. */
function NewLotRow({ onCreated }: { onCreated: (id: string) => void }) {
  const action = useFilieraAction()
  const [line, setLine] = useState<ProductLine>('olio')
  const [code, setCode] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const campaigns = useCampaigns(line)
  const list = campaigns.data?.campaigns ?? []

  const submit = (event: FormEvent) => {
    event.preventDefault()
    action.mutate(
      { path: '/admin/filiera/lots', body: { code, product_line: line, product_name: DEFAULT_NAME[line], campaign_id: campaignId || list[0]?.id }, success: 'Lotto creato in bozza: completa i dati qui sotto.' },
      {
        onSuccess: (data) => {
          setCode('')
          onCreated((data.lot as Lot).id)
        },
      },
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 border-t border-ui-border-base bg-ui-bg-subtle px-6 py-3">
      <Text size="small" weight="plus" className="mr-2">Nuovo lotto</Text>
      <select aria-label="Linea" value={line} onChange={(event) => { setLine(event.target.value as ProductLine); setCampaignId('') }} className="txt-compact-small rounded-md border border-ui-border-base bg-ui-bg-field px-2 py-1.5">
        <option value="olio">Olio</option>
        <option value="miele">Miele</option>
      </select>
      <Input size="small" aria-label="Codice lotto" placeholder="Codice, es. L2026-01" value={code} onChange={(event) => setCode(event.target.value)} className="w-48" />
      <select aria-label="Campagna" value={campaignId || list[0]?.id || ''} onChange={(event) => setCampaignId(event.target.value)} className="txt-compact-small rounded-md border border-ui-border-base bg-ui-bg-field px-2 py-1.5">
        {list.length === 0 && <option value="">Nessuna campagna: creala in «Campagne»</option>}
        {list.map((campaign) => (
          <option key={campaign.id} value={campaign.id}>
            Campagna {campaign.label}
          </option>
        ))}
      </select>
      <Button size="small" type="submit" disabled={!code.trim() || list.length === 0} isLoading={action.isPending}>
        Crea
      </Button>
    </form>
  )
}

type LineFilter = 'tutte' | ProductLine
type StatusFilter = 'tutti' | 'draft' | 'published'

export function LotsView({ initialOpenId }: { initialOpenId?: string | null }) {
  const [line, setLine] = useState<LineFilter>('tutte')
  const [status, setStatus] = useState<StatusFilter>('tutti')
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState<string | null>(initialOpenId ?? null)
  const lots = useLots({
    ...(line !== 'tutte' ? { product_line: line } : {}),
    ...(status !== 'tutti' ? { status } : {}),
    ...(search.trim() ? { q: search.trim() } : {}),
  })
  const list = lots.data?.lots ?? []

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-3 px-6 pb-4">
        <Segmented label="Linea" value={line} onChange={setLine} options={[{ value: 'tutte', label: 'Tutte' }, { value: 'olio', label: 'Olio' }, { value: 'miele', label: 'Miele' }]} />
        <Segmented label="Stato" value={status} onChange={setStatus} options={[{ value: 'tutti', label: 'Tutti' }, { value: 'draft', label: 'Bozze' }, { value: 'published', label: 'Pubblicati' }]} />
        <Input size="small" type="search" placeholder="Cerca codice o prodotto" aria-label="Cerca codice o prodotto" value={search} onChange={(event) => setSearch(event.target.value)} className="w-56" />
      </div>
      <NewLotRow onCreated={setOpenId} />

      {lots.isLoading && <div className="m-6 h-24 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />}
      {lots.data && list.length === 0 && (
        <Text size="small" className="border-t border-ui-border-base px-6 py-8 text-center text-ui-fg-subtle">
          Nessun lotto con questi filtri.
        </Text>
      )}
      {list.length > 0 && (
        <table className="w-full">
          <thead>
            <tr className="txt-compact-xsmall-plus border-t border-ui-border-base text-ui-fg-muted">
              <th className="px-6 py-2 text-left font-normal">Codice</th>
              <th className="py-2 text-left font-normal">Prodotto</th>
              <th className="py-2 text-left font-normal">Campagna</th>
              <th className="py-2 text-left font-normal">Confezionato</th>
              <th className="py-2 text-left font-normal">Scadenza</th>
              <th className="px-6 py-2 text-right font-normal">Stato</th>
            </tr>
          </thead>
          <tbody className="txt-compact-small">
            {list.map((lot) => {
              const open = openId === lot.id
              return (
                <Fragment key={lot.id}>
                  <tr className={clx('border-t border-ui-border-base', open && 'bg-ui-bg-subtle')}>
                    <td className="px-6 py-2">
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-label={`${open ? 'Chiudi' : 'Apri'} il lotto ${lot.code}`}
                        onClick={() => setOpenId(open ? null : lot.id)}
                        className="flex items-center gap-1 font-mono text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                      >
                        <ChevronDownMini className={clx('transition-transform', open && 'rotate-180')} />
                        {lot.code}
                      </button>
                    </td>
                    <td className="py-2">
                      {lot.product_name} <span className="text-ui-fg-muted">· {LINE_LABEL[lot.product_line]}</span>
                    </td>
                    <td className="py-2 text-ui-fg-subtle">{lot.campaign?.label ?? '-'}</td>
                    <td className="py-2 text-ui-fg-subtle">{lot.packaging_date ? formatDate(lot.packaging_date) : '-'}</td>
                    <td className="py-2 text-ui-fg-subtle">{lot.best_before ? formatDate(lot.best_before) : '-'}</td>
                    <td className="px-6 py-2 text-right">
                      <StatusBadge color={lot.status === 'published' ? 'green' : 'grey'}>{lot.status === 'published' ? 'Pubblicato' : 'Bozza'}</StatusBadge>
                    </td>
                  </tr>
                  {open && (
                    <tr>
                      <td colSpan={6} className="p-0">
                        <LotEditor lotId={lot.id} />
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
