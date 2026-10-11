import type { MedusaRequest } from '@medusajs/framework/http'
import { MedusaError } from '@medusajs/framework/utils'
import { FILIERA_MODULE } from '../../../modules/filiera'
import type FilieraModuleService from '../../../modules/filiera/service'
import { RegistrySchemas, type RegistryKind } from './validators'

export function filiera(req: MedusaRequest): FilieraModuleService {
  return req.scope.resolve(FILIERA_MODULE)
}

export function registryKind(value: string | undefined): RegistryKind {
  if (value && Object.prototype.hasOwnProperty.call(RegistrySchemas, value)) return value as RegistryKind
  throw new MedusaError(MedusaError.Types.NOT_FOUND, `Anagrafica sconosciuta: ${value}.`)
}

/** Validazione per le anagrafiche, il cui schema dipende dal segmento [kind] dell'indirizzo. */
export function parseRegistry(kind: RegistryKind, body: unknown, partial: boolean) {
  const schema = partial ? RegistrySchemas[kind].partial() : RegistrySchemas[kind]
  const result = schema.safeParse(body)
  if (!result.success) {
    const detail = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
    throw new MedusaError(MedusaError.Types.INVALID_DATA, `Dati non validi. ${detail}`)
  }
  return result.data as Record<string, unknown>
}

const PAGE_MAX = 200

export function paging(req: MedusaRequest) {
  const limit = Number(req.query.limit)
  const offset = Number(req.query.offset)
  const take = Number.isFinite(limit) && limit >= 1 ? Math.min(Math.floor(limit), PAGE_MAX) : 50
  const skip = Number.isFinite(offset) && offset > 0 ? Math.floor(offset) : 0
  return { take, skip }
}

export function productLineFilter(req: MedusaRequest): { product_line?: 'olio' | 'miele' } {
  const line = req.query.product_line
  return line === 'olio' || line === 'miele' ? { product_line: line } : {}
}
