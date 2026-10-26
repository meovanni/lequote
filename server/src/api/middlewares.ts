import { defineMiddlewares, validateAndTransformBody } from '@medusajs/framework/http'
import {
  AnalysisCreate,
  AnalysisUpdate,
  CampaignCreate,
  CampaignUpdate,
  LotCreate,
  LotStagesReplace,
  LotUpdate,
  StageTemplateCreate,
  StageTemplateUpdate,
  SupplierTypeCreate,
} from './admin/filiera/validators'
import { PackCreate, PriceSet, StockSet } from './admin/gestione/validators'
import { WithdrawalUpdate } from './admin/withdrawals/validators'
import { AgentCreate, AgentInvite, AgentUpdate, BookingCreate, BookingUpdate, OrderImport, PaymentCreate, SellBookingCreate } from './admin/backoffice/validators'
import { guard } from './permissions'
import { WithdrawalCreate } from './store/withdrawals/validators'

// Le rotte /admin richiedono già l'accesso al back office; qui si aggiungono i permessi per ruolo
// e la validazione dei corpi. Le anagrafiche (/admin/filiera/registries/:kind) si validano nella
// rotta, perché lo schema dipende dal tipo.
export default defineMiddlewares({
  routes: [
    ...guard('filiera', '/admin/filiera/lots'),
    ...guard('filiera', '/admin/filiera/campaigns'),
    ...guard('filiera', '/admin/filiera/stage-templates'),
    ...guard('filiera', '/admin/filiera/registries/groves'),
    ...guard('filiera', '/admin/filiera/registries/apiaries'),
    ...guard('supplier', '/admin/filiera/registries/suppliers'),
    ...guard('supplier', '/admin/filiera/supplier-types'),
    ...guard('withdrawal', '/admin/withdrawals'),
    // Ordini dal gestionale e incassi: stessi permessi degli ordini di Medusa.
    ...guard('order', '/admin/backoffice/orders'),
    ...guard('order', '/admin/backoffice/catalog'),
    ...guard('order', '/admin/backoffice/order-imports'),
    // Pagina Gestione: magazzino, prezzi e consegne stanno con gli ordini.
    ...guard('order', '/admin/gestione'),
    ...guard('agent', '/admin/agents'),
    ...guard('sales', '/admin/sell'),
    { matcher: '/admin/filiera/lots', method: 'POST', middlewares: [validateAndTransformBody(LotCreate)] },
    { matcher: '/admin/filiera/lots/:id', method: 'POST', middlewares: [validateAndTransformBody(LotUpdate)] },
    { matcher: '/admin/filiera/lots/:id/stages', method: 'POST', middlewares: [validateAndTransformBody(LotStagesReplace)] },
    { matcher: '/admin/filiera/campaigns', method: 'POST', middlewares: [validateAndTransformBody(CampaignCreate)] },
    { matcher: '/admin/filiera/campaigns/:id', method: 'POST', middlewares: [validateAndTransformBody(CampaignUpdate)] },
    {
      // Referto in base64: fino a 15 MB di file, circa 20 MB di corpo.
      matcher: '/admin/filiera/campaigns/:id/analyses',
      method: 'POST',
      bodyParser: { sizeLimit: '22mb' },
      middlewares: [validateAndTransformBody(AnalysisCreate)],
    },
    {
      matcher: '/admin/filiera/campaigns/:id/analyses/:analysisId',
      method: 'POST',
      middlewares: [validateAndTransformBody(AnalysisUpdate)],
    },
    { matcher: '/admin/filiera/stage-templates', method: 'POST', middlewares: [validateAndTransformBody(StageTemplateCreate)] },
    { matcher: '/admin/filiera/stage-templates/:id', method: 'POST', middlewares: [validateAndTransformBody(StageTemplateUpdate)] },
    { matcher: '/admin/filiera/supplier-types', method: 'POST', middlewares: [validateAndTransformBody(SupplierTypeCreate)] },
    { matcher: '/admin/gestione/stock', method: 'POST', middlewares: [validateAndTransformBody(StockSet)] },
    { matcher: '/admin/gestione/pack', method: 'POST', middlewares: [validateAndTransformBody(PackCreate)] },
    { matcher: '/admin/gestione/prices', method: 'POST', middlewares: [validateAndTransformBody(PriceSet)] },
    { matcher: '/admin/backoffice/orders', method: 'POST', middlewares: [validateAndTransformBody(BookingCreate)] },
    { matcher: '/admin/backoffice/order-imports', method: 'POST', middlewares: [validateAndTransformBody(OrderImport)] },
    { matcher: '/admin/backoffice/orders/:id', method: 'POST', middlewares: [validateAndTransformBody(BookingUpdate)] },
    { matcher: '/admin/backoffice/orders/:id/payments', method: 'POST', middlewares: [validateAndTransformBody(PaymentCreate)] },
    { matcher: '/admin/agents', method: 'POST', middlewares: [validateAndTransformBody(AgentCreate)] },
    { matcher: '/admin/agents/:id', method: 'POST', middlewares: [validateAndTransformBody(AgentUpdate)] },
    { matcher: '/admin/agents/:id/invite', method: 'POST', middlewares: [validateAndTransformBody(AgentInvite)] },
    { matcher: '/admin/sell/bookings', method: 'POST', middlewares: [validateAndTransformBody(SellBookingCreate)] },
    { matcher: '/admin/sell/bookings/:id', method: 'POST', middlewares: [validateAndTransformBody(BookingUpdate)] },
    { matcher: '/admin/sell/bookings/:id/payments', method: 'POST', middlewares: [validateAndTransformBody(PaymentCreate)] },
    { matcher: '/store/withdrawals', method: 'POST', middlewares: [validateAndTransformBody(WithdrawalCreate)] },
    { matcher: '/admin/withdrawals/:id', method: 'POST', middlewares: [validateAndTransformBody(WithdrawalUpdate)] },
  ],
})
