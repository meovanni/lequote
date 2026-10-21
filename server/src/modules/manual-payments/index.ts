import { ModuleProvider, Modules } from '@medusajs/framework/utils'
import { BackofficePaymentProvider, BankTransferProvider, PayAtPickupProvider } from './service'

export const MANUAL_PAYMENT_PROVIDER_IDS = ['pp_bonifico_lequote', 'pp_ritiro_lequote', 'pp_gestionale_lequote']

export default ModuleProvider(Modules.PAYMENT, {
  services: [BankTransferProvider, PayAtPickupProvider, BackofficePaymentProvider],
})
