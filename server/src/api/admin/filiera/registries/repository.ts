import type FilieraModuleService from '../../../../modules/filiera/service'
import type { z } from '@medusajs/framework/zod'
import type { RegistryKind, RegistrySchemas } from '../validators'

type Page = { take: number; skip: number }
type Data = Record<string, unknown>
type Input<K extends RegistryKind> = z.infer<(typeof RegistrySchemas)[K]>

/** Le anagrafiche hanno la stessa forma: un piccolo repository le rende intercambiabili. */
export function registryRepository(service: FilieraModuleService, kind: RegistryKind) {
  const byName = { order: { name: 'ASC' as const } }
  switch (kind) {
    case 'groves':
      return {
        list: (page: Page) => service.listAndCountGroves({}, { ...byName, ...page }),
        create: (data: Data) => service.createGroves({ cultivars: [], ...(data as Input<'groves'>) }),
        update: (id: string, data: Data) => service.updateGroves({ id, ...(data as Partial<Input<'groves'>>) }),
      }
    case 'apiaries':
      return {
        list: (page: Page) => service.listAndCountApiaries({}, { ...byName, ...page }),
        create: (data: Data) => service.createApiaries(data as Input<'apiaries'>),
        update: (id: string, data: Data) => service.updateApiaries({ id, ...(data as Partial<Input<'apiaries'>>) }),
      }
    case 'suppliers':
      return {
        list: (page: Page) => service.listAndCountSuppliers({}, { ...byName, ...page, relations: ['types'] }),
        create: async (data: Data) => {
          const { type_ids, ...rest } = data as Input<'suppliers'>
          const created = await service.createSuppliers({ ...rest, types: type_ids ?? [] })
          return service.retrieveSupplier(created.id, { relations: ['types'] })
        },
        update: async (id: string, data: Data) => {
          const { type_ids, ...rest } = data as Partial<Input<'suppliers'>>
          await service.updateSuppliers({ id, ...rest, ...(type_ids ? { types: type_ids } : {}) })
          return service.retrieveSupplier(id, { relations: ['types'] })
        },
      }
  }
}
