import { Module } from '@medusajs/framework/utils'
import DocumentiModuleService from './service'

export const DOCUMENTI_MODULE = 'documenti'

export default Module(DOCUMENTI_MODULE, {
  service: DocumentiModuleService,
})
