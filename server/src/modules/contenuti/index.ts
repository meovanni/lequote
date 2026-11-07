import { Module } from '@medusajs/framework/utils'
import ContenutiModuleService from './service'

export const CONTENUTI_MODULE = 'contenuti'

export default Module(CONTENUTI_MODULE, {
  service: ContenutiModuleService,
})
