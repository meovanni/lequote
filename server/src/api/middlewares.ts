import { defineMiddlewares, validateAndTransformBody } from '@medusajs/framework/http'
import {
  AnalysisCreate,
  CampaignCreate,
  CampaignUpdate,
  LotCreate,
  LotStagesReplace,
  LotUpdate,
  StageTemplateCreate,
  StageTemplateUpdate,
} from './admin/filiera/validators'
import { WithdrawalUpdate } from './admin/withdrawals/validators'
import { WithdrawalCreate } from './store/withdrawals/validators'

// Le rotte /admin richiedono già l'accesso al back office; qui si aggiunge la validazione dei corpi.
// Le anagrafiche (/admin/filiera/registries/:kind) si validano nella rotta, perché lo schema
// dipende dal tipo.
export default defineMiddlewares({
  routes: [
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
    { matcher: '/admin/filiera/stage-templates', method: 'POST', middlewares: [validateAndTransformBody(StageTemplateCreate)] },
    { matcher: '/admin/filiera/stage-templates/:id', method: 'POST', middlewares: [validateAndTransformBody(StageTemplateUpdate)] },
    { matcher: '/store/withdrawals', method: 'POST', middlewares: [validateAndTransformBody(WithdrawalCreate)] },
    { matcher: '/admin/withdrawals/:id', method: 'POST', middlewares: [validateAndTransformBody(WithdrawalUpdate)] },
  ],
})
