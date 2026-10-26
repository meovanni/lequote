import { Trash, XMarkMini } from '@medusajs/icons'
import { Button, IconButton, Input, Text, clx, usePrompt } from '@medusajs/ui'
import { useState, type FormEvent } from 'react'
import { useFilieraAction, useSupplierTypes, useSuppliers, type Supplier } from '../../lib/filiera-api'
import { InlineText } from '../inline/inline-fields'

// Fornitori (frantoi, imbottigliamento, laboratori, packaging…) in una tabella con le celle
// modificabili sul posto. Le tipologie si attivano con un clic sulla riga; in alto si creano le
// tipologie nuove. Partita IVA e codice interno restano dati interni.

const COLUMNS: { key: keyof Supplier & string; label: string; required?: boolean; type?: 'email' | 'tel' }[] = [
  { key: 'name', label: 'Nome', required: true },
  { key: 'municipality', label: 'Comune', required: true },
  { key: 'province', label: 'Prov.' },
  { key: 'phone', label: 'Telefono', type: 'tel' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'vat_number', label: 'P. IVA' },
]

function TypesBar() {
  const types = useSupplierTypes()
  const action = useFilieraAction()
  const [name, setName] = useState('')
  const create = (event: FormEvent) => {
    event.preventDefault()
    action.mutate({ path: '/admin/filiera/supplier-types', body: { name: name.trim() }, success: 'Tipologia creata.' }, { onSuccess: () => setName('') })
  }
  return (
    <div className="flex flex-wrap items-center gap-2 px-6 pb-4">
      <Text size="small" className="text-ui-fg-subtle">Tipologie:</Text>
      {(types.data?.types ?? []).map((type) => (
        <span key={type.id} className="txt-compact-small flex items-center gap-1 rounded-full bg-ui-bg-component px-2.5 py-0.5">
          {type.name}
          {!type.code && (
            <button
              type="button"
              aria-label={`Elimina la tipologia ${type.name}`}
              className="text-ui-fg-muted hover:text-ui-fg-error"
              onClick={() => action.mutate({ path: `/admin/filiera/supplier-types/${type.id}`, method: 'DELETE', success: 'Tipologia eliminata.' })}
            >
              <XMarkMini />
            </button>
          )}
        </span>
      ))}
      <form onSubmit={create} className="flex items-center gap-1">
        <Input size="small" aria-label="Nuova tipologia" placeholder="Nuova tipologia" value={name} onChange={(event) => setName(event.target.value)} className="w-40" />
        <Button size="small" variant="secondary" type="submit" disabled={!name.trim()}>
          Crea
        </Button>
      </form>
    </div>
  )
}

export function SuppliersView() {
  const suppliers = useSuppliers()
  const types = useSupplierTypes()
  const action = useFilieraAction()
  const prompt = usePrompt()
  const [name, setName] = useState('')
  const [municipality, setMunicipality] = useState('')
  const items = suppliers.data?.items ?? []

  const save = (item: Supplier, body: Record<string, unknown>) =>
    action.mutate({ path: `/admin/filiera/registries/suppliers/${item.id}`, body, success: 'Salvato.' })
  const toggleType = (item: Supplier, typeId: string) => {
    const current = (item.types ?? []).map((type) => type.id)
    save(item, { type_ids: current.includes(typeId) ? current.filter((id) => id !== typeId) : [...current, typeId] })
  }
  const remove = async (item: Supplier) => {
    const confirmed = await prompt({
      title: `Eliminare ${item.name}?`,
      description: 'Si può eliminare solo un fornitore che nessuna campagna e nessun lotto usa.',
      confirmText: 'Elimina',
      cancelText: 'Annulla',
    })
    if (confirmed) action.mutate({ path: `/admin/filiera/registries/suppliers/${item.id}`, method: 'DELETE', success: 'Fornitore eliminato.' })
  }
  const create = (event: FormEvent) => {
    event.preventDefault()
    action.mutate(
      { path: '/admin/filiera/registries/suppliers', body: { name: name.trim(), municipality: municipality.trim() }, success: 'Fornitore aggiunto: completa i dati nella riga.' },
      { onSuccess: () => { setName(''); setMunicipality('') } },
    )
  }

  return (
    <div className="flex flex-col pb-4">
      <TypesBar />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="txt-compact-xsmall-plus border-t border-ui-border-base text-ui-fg-muted">
              {COLUMNS.map((column) => (
                <th key={column.key} className="px-2 py-2 text-left font-normal first:pl-6">{column.label}</th>
              ))}
              <th className="px-2 py-2 text-left font-normal">Tipologie (clic per attivare)</th>
              <th className="px-6 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-ui-border-base align-top">
                {COLUMNS.map((column) => (
                  <td key={column.key} className="px-1 py-1 first:pl-4">
                    <InlineText
                      type={column.type}
                      value={(item[column.key] as string | null) ?? ''}
                      label={`${column.label} di ${item.name}`}
                      required={column.required}
                      className={column.key === 'name' ? 'min-w-[13rem]' : undefined}
                      onSave={(value) => save(item, { [column.key]: value })}
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <div className="flex flex-wrap gap-1">
                    {(types.data?.types ?? []).map((type) => {
                      const on = (item.types ?? []).some((entry) => entry.id === type.id)
                      return (
                        <button
                          key={type.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleType(item, type.id)}
                          className={clx(
                            'txt-compact-xsmall rounded-full border px-2 py-0.5 transition-colors',
                            on ? 'border-ui-border-interactive bg-ui-bg-highlight text-ui-fg-base' : 'border-ui-border-base text-ui-fg-muted hover:text-ui-fg-base',
                          )}
                        >
                          {type.name}
                        </button>
                      )
                    })}
                  </div>
                </td>
                <td className="px-6 py-1 text-right">
                  <IconButton size="small" variant="transparent" aria-label={`Elimina ${item.name}`} onClick={() => void remove(item)}>
                    <Trash />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form onSubmit={create} className="flex flex-wrap items-center gap-2 border-t border-ui-border-base bg-ui-bg-subtle px-6 py-3">
        <Text size="small" weight="plus" className="mr-2">Nuovo fornitore</Text>
        <Input size="small" aria-label="Nome" placeholder="Nome" value={name} onChange={(event) => setName(event.target.value)} className="w-52" />
        <Input size="small" aria-label="Comune" placeholder="Comune" value={municipality} onChange={(event) => setMunicipality(event.target.value)} className="w-44" />
        <Button size="small" type="submit" disabled={!name.trim() || !municipality.trim()} isLoading={action.isPending}>
          Aggiungi
        </Button>
      </form>
    </div>
  )
}
