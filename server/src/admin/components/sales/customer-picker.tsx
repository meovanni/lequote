import { Input, Text } from '@medusajs/ui'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { sdk } from '../../lib/sdk'

// Ricerca di un cliente già visto negli ordini: scelto, i suoi dati riempiono il modulo e si
// possono ancora correggere. Per gli agenti la rubrica contiene solo i loro clienti.

export type KnownCustomer = {
  key: string
  label: string
  kind: 'privato' | 'azienda'
  first_name: string
  last_name: string
  company: string
  vat_number: string
  fiscal_code: string
  email: string
  phone: string
  address_1: string
  postal_code: string
  city: string
  province: string
  orders: number
}

const MAX_RESULTS = 8

const haystack = (customer: KnownCustomer) =>
  [customer.label, customer.vat_number, customer.fiscal_code, customer.phone, customer.email, customer.city].join(' ').toLowerCase()

export function CustomerPicker({ path, onPick }: { path: string; onPick: (customer: KnownCustomer) => void }) {
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const known = useQuery({
    queryKey: ['vendite', 'customers', path],
    queryFn: () => sdk.client.fetch<{ customers: KnownCustomer[] }>(path),
  })
  const customers = known.data?.customers ?? []
  const matches = useMemo(() => {
    const words = term.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (words.length === 0) return []
    return customers.filter((customer) => words.every((word) => haystack(customer).includes(word))).slice(0, MAX_RESULTS)
  }, [customers, term])

  if (known.isSuccess && customers.length === 0) return null
  return (
    <div className="relative">
      <Input
        size="small"
        type="search"
        placeholder="Cerca un cliente già noto (nome, ragione sociale, P.IVA, telefono)"
        aria-label="Cerca un cliente già noto"
        value={term}
        onChange={(event) => {
          setTerm(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
      />
      {open && term.trim() && (
        <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-ui-border-base bg-ui-bg-base shadow-elevation-flyout" role="listbox">
          {matches.length === 0 ? (
            <li className="px-3 py-2">
              <Text size="small" className="text-ui-fg-subtle">
                Nessun cliente trovato: scrivi i dati qui sotto.
              </Text>
            </li>
          ) : (
            matches.map((customer) => (
              <li key={customer.key} role="option" aria-selected={false}>
                <button
                  type="button"
                  className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-ui-bg-base-hover"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onPick(customer)
                    setTerm('')
                    setOpen(false)
                  }}
                >
                  <Text size="small" weight="plus">
                    {customer.label}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {[customer.vat_number && `P.IVA ${customer.vat_number}`, customer.city, customer.phone, customer.orders === 1 ? '1 ordine' : `${customer.orders} ordini`]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
