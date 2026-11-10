import { Input, Label, RadioGroup } from '@medusajs/ui'
import { FormField } from '../form-field'
import type { Party } from '../../lib/documenti-api'

// Dati del cliente di un DDT o di una fattura, precompilati con quelli dell'ordine: si
// correggono qui e restano sul documento (l'ordine non cambia).

type Key = Exclude<keyof Party, 'kind'>

export function PartyFields({ id, party, onChange, invoice = false }: { id: string; party: Party; onChange: (party: Party) => void; invoice?: boolean }) {
  const azienda = party.kind === 'azienda'
  const field = (key: Key, label: string, hint?: string, className = '') => (
    <div className={className}>
      <FormField id={`${id}-${key}`} label={label} hint={hint}>
        <Input id={`${id}-${key}`} size="small" value={party[key]} onChange={(event) => onChange({ ...party, [key]: event.target.value })} />
      </FormField>
    </div>
  )
  return (
    <div className="flex flex-col gap-3">
      <RadioGroup value={party.kind} onValueChange={(kind) => onChange({ ...party, kind: kind as Party['kind'] })} className="flex gap-5">
        {(['privato', 'azienda'] as const).map((kind) => (
          <div key={kind} className="flex items-center gap-2">
            <RadioGroup.Item value={kind} id={`${id}-kind-${kind}`} />
            <Label htmlFor={`${id}-kind-${kind}`} size="small">
              {kind === 'privato' ? 'Privato' : 'Azienda'}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {field('name', azienda ? 'Ragione sociale' : 'Nome e cognome', undefined, 'col-span-2 md:col-span-3')}
        {azienda
          ? field('vat', 'Partita IVA', invoice ? '11 cifre.' : undefined, 'col-span-2 md:col-span-3')
          : field('fiscalCode', 'Codice fiscale', invoice ? '16 caratteri.' : undefined, 'col-span-2 md:col-span-3')}
        {field('address', 'Indirizzo', undefined, 'col-span-2 md:col-span-3')}
        {field('postalCode', 'CAP', undefined, 'md:col-span-1')}
        {field('city', 'Comune', undefined, 'md:col-span-1')}
        {field('province', 'Prov.', undefined, 'md:col-span-1')}
        {invoice && field('sdiCode', 'Codice destinatario SDI', 'Facoltativo: 7 caratteri.', 'col-span-2 md:col-span-3')}
        {invoice && field('pec', 'PEC', 'Facoltativa.', 'col-span-2 md:col-span-3')}
      </div>
    </div>
  )
}
