import type { MedusaContainer } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { updateRegionsWorkflow } from '@medusajs/medusa/core-flows'
import { MANUAL_PAYMENT_PROVIDER_IDS } from '../modules/manual-payments'

// Database già popolati prima dei fornitori bonifico / al ritiro: li aggiunge alla regione Italia.
// Gira una volta sola con "npm run migrate". Su un database nuovo la regione non esiste ancora e
// ci pensa il seed.
export default async function regionManualPayments({ container }: { container: MedusaContainer }) {
  const regions = await container.resolve(Modules.REGION).listRegions({}, { relations: ['payment_providers'] })
  for (const region of regions) {
    const current = (region.payment_providers ?? []).map((provider) => provider.id)
    const next = [...new Set([...current, ...MANUAL_PAYMENT_PROVIDER_IDS])]
    if (next.length === current.length) continue
    await updateRegionsWorkflow(container).run({ input: { selector: { id: region.id }, update: { payment_providers: next } } })
  }
}
