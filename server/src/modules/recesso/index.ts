import { Module } from '@medusajs/framework/utils'
import RecessoModuleService from './service'

export const RECESSO_MODULE = 'recesso'

export default Module(RECESSO_MODULE, {
  service: RecessoModuleService,
})
