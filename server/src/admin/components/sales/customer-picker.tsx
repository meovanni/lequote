import { Button, Text } from '@medusajs/ui'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { matchKnownCustomers, type KnownCustomer, type TypedCustomer } from '../../lib/known-customers'
import { sdk } from '../../lib/sdk'

// Mentre si scrivono nome, ragione sociale, P.IVA o telefono, i clienti già visti negli ordini
// che corrispondono compaiono sotto i campi: scelto uno, i suoi dati riempiono il modulo e si
// possono ancora correggere. Per gli agenti la rubrica contiene solo i loro clienti.

export type { KnownCustomer }

type Props = {
  path: string
  typed: TypedCustomer
  /** Il cliente appena scelto: non si ripropone. */
  pickedKey: string | null
  onPick: (customer: KnownCustomer) => void
}

const details = (customer: KnownCustomer) =>
  [customer.vat_number && `P.IVA ${customer.vat_number}`, customer.city, customer.phone, customer.orders === 0 ? 'nessun ordine' : customer.orders === 1 ? '1 ordine' : `${customer.orders} ordini`]
    .filter(Boolean)
    .join(' · ')

export function CustomerSuggestions({ path, typed, pickedKey, onPick }: Props) {
  const known = useQuery({
    queryKey: ['vendite', 'customers', path],
    queryFn: () => sdk.client.fetch<{ customers: KnownCustomer[] }>(path),
  })
  const customers = known.data?.customers
  const matches = useMemo(() => matchKnownCustomers(customers ?? [], typed, pickedKey), [customers, typed, pickedKey])

  if (matches.length === 0) return null
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3" aria-live="polite">
      <Text size="small" weight="plus">
        {matches.length === 1 ? 'Cliente già noto' : 'Clienti già noti'}: scegli per usare i suoi dati
      </Text>
      <ul className="flex flex-col gap-1">
        {matches.map((customer) => (
          <li key={customer.key} className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-col">
              <Text size="small">{customer.label}</Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                {details(customer)}
              </Text>
            </div>
            <Button type="button" size="small" variant="secondary" onClick={() => onPick(customer)}>
              Usa questi dati
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
