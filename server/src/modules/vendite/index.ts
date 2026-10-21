import { Module } from '@medusajs/framework/utils'
import VenditeModuleService from './service'

export const VENDITE_MODULE = 'vendite'

export default Module(VENDITE_MODULE, {
  service: VenditeModuleService,
})
