// Ordini inseriti dal gestionale: prenotazioni degli agenti e nuovi ordini dal back office.

/** Chi ha inserito l'ordine, salvato in metadata.inserted_by (assente = ordine dal sito). */
export type Actor = { type: 'admin' | 'agente'; id: string; name: string }

export type BookingCustomer = {
  kind: 'privato' | 'azienda'
  first_name: string
  last_name: string
  /** Ragione sociale, per le aziende. */
  company?: string | null
  vat_number?: string | null
  fiscal_code?: string | null
  email?: string | null
  phone: string
  address_1?: string | null
  postal_code?: string | null
  city?: string | null
  province?: string | null
}

export type BookingInput = {
  customer: BookingCustomer
  items: { variant_id: string; quantity: number }[]
  /** Opzione di consegna (ritiro in sede o spedizione, se attiva). */
  shipping_option_id: string
  notes?: string | null
  /** Agente a cui attribuire la vendita: sempre il proprio per l'agente, a scelta per l'amministratore. */
  agent_id?: string | null
}

export type PaymentInput = {
  amount: number
  method: 'contanti' | 'bonifico' | 'assegno' | 'carta' | 'altro'
  paid_at?: Date
  notes?: string | null
}
