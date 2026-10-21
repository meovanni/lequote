import { medusaIntegrationTestRunner } from '@medusajs/test-utils'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { AGENT_ROLE_ID, ensureRoles } from '../../src/lib/roles'
import { adminWithRoles } from '../helpers/admin'

jest.setTimeout(180 * 1000)

// Ruoli del back office: l'Amministratore apre tutto, l'Agente solo l'area vendita.
medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    const fail = (error: { response: unknown }) => error.response as { status: number; data: { message: string } }

    beforeEach(async () => {
      await ensureRoles(getContainer())
    })

    it('l’amministratore apre filiera, fornitori, recessi e ordini', async () => {
      const admin = await adminWithRoles(getContainer(), 'titolare@test.local')
      for (const path of ['/admin/filiera/lots', '/admin/filiera/registries/suppliers', '/admin/withdrawals', '/admin/orders']) {
        expect((await api.get(path, admin)).status).toBe(200)
      }
    })

    it('l’agente non apre filiera, fornitori, recessi né gli ordini di tutti', async () => {
      const agent = await adminWithRoles(getContainer(), 'bruno@test.local', [AGENT_ROLE_ID])
      for (const path of ['/admin/filiera/lots', '/admin/filiera/registries/suppliers', '/admin/withdrawals', '/admin/orders', '/admin/customers']) {
        expect((await api.get(path, agent).catch(fail)).status).toBe(403)
      }
      const create = await api.post('/admin/filiera/supplier-types', { name: 'Vetreria' }, agent).catch(fail)
      expect(create.status).toBe(403)
    })

    it('dà il ruolo di amministratore agli utenti che non ne hanno, una volta sola', async () => {
      const user = await getContainer().resolve(Modules.USER).createUsers({ email: 'vecchio@test.local' })
      expect((await ensureRoles(getContainer())).promoted).toBe(1)
      expect((await ensureRoles(getContainer())).promoted).toBe(0)

      const { data } = await getContainer()
        .resolve(ContainerRegistrationKeys.QUERY)
        .graph({ entity: 'user', fields: ['rbac_roles.id'], filters: { id: user.id } })
      expect((data[0] as unknown as { rbac_roles: { id: string }[] }).rbac_roles.map((role) => role.id)).toEqual(['role_super_admin'])
    })
  },
})
