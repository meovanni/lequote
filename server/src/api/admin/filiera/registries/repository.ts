import type FilieraModuleService from '../../../../modules/filiera/service'
import type { z } from '@medusajs/framework/zod'
import type { RegistryKind, RegistrySchemas } from '../validators'

type Page = { take: number; skip: number }
type Data = Record<string, unknown>
type Input<K extends RegistryKind> = z.infer<(typeof RegistrySchemas)[K]>

/** Le quattro anagrafiche hanno la stessa forma: un piccolo repository le rende intercambiabili. */
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
    case 'mills':
      return {
        list: (page: Page) => service.listAndCountMills({}, { ...byName, ...page }),
        create: (data: Data) => service.createMills(data as Input<'mills'>),
        update: (id: string, data: Data) => service.updateMills({ id, ...(data as Partial<Input<'mills'>>) }),
      }
    case 'establishments':
      return {
        list: (page: Page) => service.listAndCountEstablishments({}, { ...byName, ...page }),
        create: (data: Data) => service.createEstablishments(data as Input<'establishments'>),
        update: (id: string, data: Data) => service.updateEstablishments({ id, ...(data as Partial<Input<'establishments'>>) }),
      }
  }
}
