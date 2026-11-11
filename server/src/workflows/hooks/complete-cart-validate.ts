import { completeCartWorkflow } from '@medusajs/medusa/core-flows'
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'
import { backofficeSecret, verifyBackofficeCart } from '../../lib/backoffice-signature'
import { backofficePaymentViolation, payAtPickupViolation } from '../../lib/checkout-rules'
import { assertAvailable } from '../../lib/magazzino'
import { formatOf } from '../../modules/magazzino/lib/formats'

type CartForValidation = {
  id: string
  metadata?: Record<string, unknown> | null
  shipping_methods?: ({ shipping_option_id?: string | null } | null)[] | null
  payment_collection?: { payment_sessions?: ({ provider_id?: string | null } | null)[] | null } | null
}

/** Chiavi dei metadata d'ordine scritte solo dal server (consegna, cliente, chi ha inserito, note, firma). */
const RESERVED_ORDER_KEYS = new Set(['delivered', 'inserted_by', 'customer', 'notes', 'backoffice_signature'])

// Prima di creare l'ordine: il pagamento al ritiro vale solo con il ritiro in sede, quello del
// gestionale solo per i carrelli costruiti e firmati dal server. Dal sito si ordinano solo i formati
// confezionati (lo sfuso "da imbottigliare" passa dal gestionale) e nei limiti del magazzino.
completeCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  const { shipping_methods, payment_collection } = cart as CartForValidation
  const providerIds = (payment_collection?.payment_sessions ?? []).flatMap((session) =>
    session?.provider_id ? [session.provider_id] : [],
  )
  const optionIds = (shipping_methods ?? []).flatMap((method) =>
    method?.shipping_option_id ? [method.shipping_option_id] : [],
  )

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: options } = optionIds.length
    ? await query.graph({ entity: 'shipping_option', fields: ['id', 'type.code'], filters: { id: optionIds } })
    : { data: [] }
  const codeById = new Map(options.map((option) => [option.id, option.type?.code ?? null]))

  // Una consegna senza opzione conta come spedizione, così il controllo resta dalla parte sicura.
  const optionCodes = (shipping_methods ?? []).map((method) =>
    method?.shipping_option_id ? (codeById.get(method.shipping_option_id) ?? null) : null,
  )

  const signed = verifyBackofficeCart(cart.id, (cart as CartForValidation).metadata?.backoffice_signature, backofficeSecret())
  const violation = backofficePaymentViolation({ providerIds, signed }) ?? payAtPickupViolation({ providerIds, optionCodes })
  if (violation) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, violation)
  }
  // I carrelli del gestionale sono già controllati da placeBooking (lib/bookings/create.ts).
  if (signed) return

  // Le chiavi che il gestionale scrive nell'ordine non possono arrivare da un carrello del sito.
  const reserved = Object.keys((cart as CartForValidation).metadata ?? {}).filter((key) => RESERVED_ORDER_KEYS.has(key))
  if (reserved.length > 0) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, 'Carrello non valido.')
  }

  const { data: carts } = await query.graph({ entity: 'cart', fields: ['id', 'items.variant_sku', 'items.quantity'], filters: { id: cart.id } })
  const items = ((carts[0] as unknown as { items?: ({ variant_sku: string | null; quantity: unknown } | null)[] } | undefined)?.items ?? []).flatMap(
    (item) => (item ? [{ sku: item.variant_sku, quantity: Number(item.quantity) }] : []),
  )
  if (items.some((item) => formatOf(item.sku)?.bulk)) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, 'L’olio e il miele sfusi si ordinano solo contattando l’azienda.')
  }
  await assertAvailable(container, items)
})
