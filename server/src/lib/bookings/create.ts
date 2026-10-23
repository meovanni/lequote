import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, MedusaError, Modules } from '@medusajs/framework/utils'
import {
  addShippingMethodToCartWorkflow,
  completeCartWorkflow,
  createCartWorkflow,
  createPaymentCollectionForCartWorkflow,
  createPaymentSessionsWorkflow,
  updateCartWorkflow,
} from '@medusajs/medusa/core-flows'
import { VENDITE_MODULE } from '../../modules/vendite'
import { backofficeSecret, signBackofficeCart } from '../backoffice-signature'
import { BACKOFFICE_PROVIDER_ID } from '../checkout-rules'
import { deliveryOptions, SALES_CHANNEL } from './catalog'
import { assertStock, explainInventoryError } from './stock'
import type { Actor, BookingInput } from './types'

/**
 * Nuovo ordine dal gestionale: un carrello costruito dal server e chiuso con lo stesso flusso del
 * sito, così IVA, giacenze riservate, regole del checkout ed email restano quelle di sempre. Il
 * pagamento è quello del gestionale (incassi registrati a mano, anche ad acconti).
 */
export async function placeBooking(container: MedusaContainer, input: BookingInput, actor: Actor): Promise<{ orderId: string }> {
  const [region] = await container.resolve(Modules.REGION).listRegions({}, { take: 1 })
  const [channel] = await container.resolve(Modules.SALES_CHANNEL).listSalesChannels({ name: SALES_CHANNEL })
  const { customer } = input
  // Consegna non indicata (prenotazione veloce di un agente): la prima disponibile, cioè un ritiro in sede.
  const shippingOptionId = input.shipping_option_id ?? (await deliveryOptions(container))[0]?.id
  if (!shippingOptionId) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, 'Nessuna consegna disponibile: attiva almeno un ritiro.')
  // Prima di creare il carrello: si ordina solo quello che si può riservare.
  await assertStock(container, input.items)
  const address = {
    first_name: customer.first_name ?? undefined,
    last_name: customer.last_name ?? undefined,
    company: customer.company ?? undefined,
    phone: customer.phone ?? undefined,
    address_1: customer.address_1 ?? undefined,
    postal_code: customer.postal_code ?? undefined,
    city: customer.city ?? undefined,
    province: customer.province ?? undefined,
    country_code: 'it',
  }
  const metadata = {
    inserted_by: actor,
    customer: { kind: customer.kind, vat_number: customer.vat_number ?? null, fiscal_code: customer.fiscal_code ?? null },
    ...(input.notes ? { notes: input.notes } : {}),
  }

  const { result: cart } = await createCartWorkflow(container).run({
    input: {
      region_id: region.id,
      sales_channel_id: channel.id,
      ...(customer.email ? { email: customer.email } : {}),
      locale: 'it',
      // Un prezzo forzato è IVA inclusa, come quelli del listino.
      items: input.items.map((item) => (item.unit_price === undefined ? item : { ...item, is_tax_inclusive: true })),
      shipping_address: address,
      billing_address: address,
      metadata,
    },
  })
  await updateCartWorkflow(container).run({
    input: { id: cart.id, metadata: { ...metadata, backoffice_signature: signBackofficeCart(cart.id, backofficeSecret()) } },
  })
  await addShippingMethodToCartWorkflow(container).run({ input: { cart_id: cart.id, options: [{ id: shippingOptionId }] } })
  const { result: collection } = await createPaymentCollectionForCartWorkflow(container).run({ input: { cart_id: cart.id } })
  await createPaymentSessionsWorkflow(container).run({ input: { payment_collection_id: collection.id, provider_id: BACKOFFICE_PROVIDER_ID } })
  const { result } = await completeCartWorkflow(container)
    .run({ input: { id: cart.id } })
    .catch((error: unknown) => {
      throw explainInventoryError(error)
    })
  const orderId = result.id

  // La firma serve solo a chiudere il carrello: sull'ordine non resta (una chiave vuota si cancella).
  await container.resolve(Modules.ORDER).updateOrders(orderId, { metadata: { backoffice_signature: '' } })

  if (input.agent_id) {
    await container.resolve(ContainerRegistrationKeys.LINK).create({
      [VENDITE_MODULE]: { sales_agent_id: input.agent_id },
      [Modules.ORDER]: { order_id: orderId },
    })
  }
  return { orderId }
}
