import { z } from '@medusajs/framework/zod'

// Ordini e prenotazioni inseriti dal gestionale, incassi, agenti.

const text = z.string().trim().min(1).max(200)
const optionalText = z.string().trim().max(200).nullish()
const id = z.string().trim().min(1).max(100)
const lines = z
  .array(z.object({ variant_id: id, quantity: z.number().int().min(0).max(10_000) }))
  .min(1)
  .max(50)

const customer = z
  .object({
    kind: z.enum(['privato', 'azienda']),
    first_name: text,
    last_name: text,
    company: optionalText,
    vat_number: z.string().trim().regex(/^\d{11}$/, 'Partita IVA di 11 cifre').nullish(),
    fiscal_code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{11,16}$/, 'Codice fiscale non valido').nullish(),
    email: z.string().trim().email().max(320).nullish(),
    phone: z.string().trim().min(5).max(50),
    address_1: optionalText,
    postal_code: z.string().trim().max(10).nullish(),
    city: optionalText,
    province: z.string().trim().max(4).nullish(),
  })
  .superRefine((value, ctx) => {
    if (value.kind === 'azienda' && !value.company) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['company'], message: 'Per un’azienda serve la ragione sociale.' })
    }
    if (value.kind === 'azienda' && !value.vat_number) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['vat_number'], message: 'Per un’azienda serve la partita IVA.' })
    }
  })

export const BookingCreate = z
  .object({
    customer,
    items: lines.refine((items) => items.some((item) => item.quantity > 0), 'Serve almeno un prodotto.'),
    shipping_option_id: id,
    notes: z.string().trim().max(1000).nullish(),
    agent_id: id.nullish(),
  })
  .strict()

// Prenotazioni degli agenti: basta il nome o il cognome del cliente e almeno un prodotto. Il resto
// è facoltativo; i dati indicati devono comunque essere validi (P.IVA, email, codice fiscale).
const agentCustomer = z
  .object({
    kind: z.enum(['privato', 'azienda']).default('privato'),
    first_name: optionalText,
    last_name: optionalText,
    company: optionalText,
    vat_number: z.string().trim().regex(/^\d{11}$/, 'Partita IVA di 11 cifre').nullish(),
    fiscal_code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{11,16}$/, 'Codice fiscale non valido').nullish(),
    email: z.string().trim().email().max(320).nullish(),
    phone: z.string().trim().max(50).nullish(),
    address_1: optionalText,
    postal_code: z.string().trim().max(10).nullish(),
    city: optionalText,
    province: z.string().trim().max(4).nullish(),
  })
  .refine((value) => Boolean(value.first_name || value.last_name), {
    path: ['first_name'],
    message: 'Serve almeno il nome o il cognome del cliente.',
  })

export const SellBookingCreate = z
  .object({
    customer: agentCustomer,
    items: lines.refine((items) => items.some((item) => item.quantity > 0), 'Serve almeno un prodotto.'),
    shipping_option_id: id.nullish(),
    notes: z.string().trim().max(1000).nullish(),
  })
  .strict()

export const BookingUpdate = z
  .object({
    items: lines.optional(),
    notes: z.string().trim().max(1000).nullish(),
    email: z.string().trim().email().max(320).nullish(),
  })
  .strict()

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data nel formato AAAA-MM-GG')
  .transform((value) => new Date(`${value}T12:00:00Z`))

export const PaymentCreate = z
  .object({
    amount: z.number().positive().max(1_000_000),
    method: z.enum(['contanti', 'bonifico', 'assegno', 'carta', 'altro']),
    paid_at: isoDate.optional(),
    notes: z.string().trim().max(500).nullish(),
  })
  .strict()

export const AgentCreate = z
  .object({
    name: text,
    email: z.string().trim().toLowerCase().email().max(320).nullish(),
    phone: z.string().trim().max(50).nullish(),
    notes: z.string().trim().max(1000).nullish(),
  })
  .strict()

export const AgentUpdate = AgentCreate.partial().extend({ active: z.boolean().optional() }).strict()

export const AgentInvite = z.object({ email: z.string().trim().toLowerCase().email().max(320) }).strict()
