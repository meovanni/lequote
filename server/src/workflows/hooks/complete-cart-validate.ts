import { completeCartWorkflow } from '@medusajs/medusa/core-flows'
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'
import { backofficeSecret, verifyBackofficeCart } from '../../lib/backoffice-signature'
import { backofficePaymentViolation, payAtPickupViolation } from '../../lib/checkout-rules'

type CartForValidation = {
  id: string
  metadata?: Record<string, unknown> | null
  shipping_methods?: ({ shipping_option_id?: string | null } | null)[] | null
  payment_collection?: { payment_sessions?: ({ provider_id?: string | null } | null)[] | null } | null
}

// Prima di creare l'ordine: il pagamento al ritiro vale solo con il ritiro in sede, quello del
// gestionale solo per i carrelli costruiti e firmati dal server.
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
})
