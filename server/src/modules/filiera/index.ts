import { Module } from '@medusajs/framework/utils'
import FilieraModuleService from './service'

export const FILIERA_MODULE = 'filiera'

export default Module(FILIERA_MODULE, {
  service: FilieraModuleService,
})
