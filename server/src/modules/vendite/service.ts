import { MedusaService } from '@medusajs/framework/utils'
import { SalesAgent } from './models/agent'
import { SalePayment } from './models/sale-payment'

class VenditeModuleService extends MedusaService({ SalesAgent, SalePayment }) {}

export default VenditeModuleService
