import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { createShippingOptionsWorkflow } from '@medusajs/medusa/core-flows'

// Consegna a cura dell'agente: l'agente porta la merce al cliente. Gratuita, solo per gli ordini
// del gestionale (prenotazioni degli agenti e nuovi ordini dal back office): la regola
// "backoffice = true" vale solo per i carrelli firmati dal server (hook
// shipping-options-context), quindi sul sito non compare e non si può scegliere.

export const AGENT_DELIVERY_CODE = 'consegna-agente'
export const AGENT_DELIVERY_NAME = 'Consegna a cura dell’agente'
export const BACKOFFICE_RULE = 'backoffice'

export function isAgentDeliveryCode(code: string | null | undefined): boolean {
  return code === AGENT_DELIVERY_CODE
}

/**
 * Crea l'opzione se manca, nella zona della prima sede con spedizione (o della prima sede).
 * Restituisce false se non c'è ancora nessuna sede: sui database nuovi la crea poi il seed.
 */
export async function ensureAgentDelivery(container: MedusaContainer): Promise<boolean> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: existing } = await query.graph({ entity: 'shipping_option', fields: ['id', 'type.code'] })
  if (existing.some((option) => isAgentDeliveryCode(option.type?.code))) return true

  const fulfillment = container.resolve(Modules.FULFILLMENT)
  const sets = await fulfillment.listFulfillmentSets({}, { relations: ['service_zones'] })
  const set = sets.find((candidate) => candidate.type === 'shipping') ?? sets[0]
  const zone = set?.service_zones?.[0]
  const [profile] = await fulfillment.listShippingProfiles({ type: 'default' })
  if (!zone || !profile) return false

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: AGENT_DELIVERY_NAME,
        price_type: 'flat',
        provider_id: 'manual_manual',
        service_zone_id: zone.id,
        shipping_profile_id: profile.id,
        type: { label: AGENT_DELIVERY_NAME, description: 'L’agente porta la merce al cliente.', code: AGENT_DELIVERY_CODE },
        prices: [{ currency_code: 'eur', amount: 0 }],
        rules: [
          { attribute: 'enabled_in_store', value: 'true', operator: 'eq' },
          { attribute: 'is_return', value: 'false', operator: 'eq' },
          { attribute: BACKOFFICE_RULE, value: 'true', operator: 'eq' },
        ],
      },
    ],
  })
  return true
}
