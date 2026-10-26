import { Module } from '@medusajs/framework/utils'
import MagazzinoModuleService from './service'

export const MAGAZZINO_MODULE = 'magazzino'

export default Module(MAGAZZINO_MODULE, {
  service: MagazzinoModuleService,
})
