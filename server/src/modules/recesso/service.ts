import { MedusaService } from '@medusajs/framework/utils'
import { Withdrawal } from './models/withdrawal'

class RecessoModuleService extends MedusaService({ Withdrawal }) {}

export default RecessoModuleService
