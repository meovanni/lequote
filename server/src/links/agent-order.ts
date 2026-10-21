import { defineLink } from '@medusajs/framework/utils'
import OrderModule from '@medusajs/medusa/order'
import VenditeModule from '../modules/vendite'

// Un agente, molti ordini: le prenotazioni che ha inserito (riepiloghi, storico, classifica).
export default defineLink(VenditeModule.linkable.salesAgent, { linkable: OrderModule.linkable.order, isList: true })
