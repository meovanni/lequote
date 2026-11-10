import { z } from '@medusajs/framework/zod'

// DDT e fatture: i dati del cliente arrivano dal modulo, già precompilati con quelli dell'ordine.

const field = (max = 200) => z.string().trim().max(max).default('')

export const Party = z.object({
  kind: z.enum(['privato', 'azienda']),
  name: field(),
  address: field(),
  postalCode: field(10),
  city: field(100),
  province: field(4),
  vat: field(20),
  fiscalCode: field(20),
  sdiCode: field(10),
  pec: field(200),
  email: field(200),
  phone: field(40),
})

export const DdtCreate = z
  .object({
    recipient: Party,
    destination: field(300),
    reason: field(100),
    carrier: z.enum(['mittente', 'destinatario', 'vettore']).default('mittente'),
    carrierName: field(200),
    packages: z.number().int().min(0).max(100_000).nullable().default(null),
    appearance: field(100),
    weightKg: z.number().min(0).max(100_000).nullable().default(null),
    transportStart: z.coerce.date().optional(),
    lots: z.array(field(40)).max(50).default([]),
    notes: field(500),
  })
  .strict()

export const InvoiceCreate = z
  .object({
    order_ids: z.array(z.string().trim().min(1).max(100)).min(1).max(200),
    customer: Party,
    number: z.number().int().min(1).max(1_000_000).optional(),
    issuedAt: z.coerce.date().optional(),
    paymentTerms: field(200),
    notes: field(500),
  })
  .strict()
