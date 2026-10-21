import { completeCartWorkflow } from '@medusajs/medusa/core-flows'
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'
import { payAtPickupViolation } from '../../lib/checkout-rules'

type CartForValidation = {
  shipping_methods?: ({ shipping_option_id?: string | null } | null)[] | null
  payment_collection?: { payment_sessions?: ({ provider_id?: string | null } | null)[] | null } | null
}

// Prima di creare l'ordine: il pagamento al ritiro vale solo con il ritiro in sede.
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

  const violation = payAtPickupViolation({ providerIds, optionCodes })
  if (violation) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, violation)
  }
})
