import { listShippingOptionsForCartWithPricingWorkflow } from '@medusajs/medusa/core-flows'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { StepResponse } from '@medusajs/framework/workflows-sdk'
import { BACKOFFICE_RULE } from '../../lib/agent-delivery'
import { backofficeSecret, verifyBackofficeCart } from '../../lib/backoffice-signature'

// Nel contesto delle consegne di un carrello: "backoffice" è "true" solo per i carrelli costruiti
// e firmati dal server. Le opzioni riservate al gestionale (consegna a cura dell'agente) lo
// richiedono, quindi i carrelli del sito non le vedono e non possono sceglierle.
// Il carrello che arriva qui non porta i metadati: la firma si legge a parte.
listShippingOptionsForCartWithPricingWorkflow.hooks.setShippingOptionsContext(async ({ cart }, { container }) => {
  const { id } = cart as { id: string }
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: 'cart', fields: ['id', 'metadata'], filters: { id } })
  const metadata = (data[0]?.metadata ?? null) as Record<string, unknown> | null
  const signed = verifyBackofficeCart(id, metadata?.backoffice_signature, backofficeSecret())
  return new StepResponse({ [BACKOFFICE_RULE]: signed ? 'true' : 'false' })
})
