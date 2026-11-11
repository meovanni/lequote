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

    it('registra all’avvio i permessi delle nostre sezioni (src/policies)', async () => {
      const policies = await getContainer().resolve(Modules.RBAC).listRbacPolicies({})
      expect(policies.map((policy) => policy.key)).toEqual(expect.arrayContaining(['filiera:read', 'supplier:update', 'withdrawal:read', 'agent:create', 'sales:read']))
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

    it('l’agente non passa dalle rotte di Medusa senza permessi propri (ricerca, layout, ruoli)', async () => {
      const admin = await adminWithRoles(getContainer(), 'titolare@test.local')
      const agent = await adminWithRoles(getContainer(), 'bruno@test.local', [AGENT_ROLE_ID])
      expect((await api.get('/admin/search?q=test', admin).catch(fail)).status).not.toBe(403)
      expect((await api.get('/admin/search?q=test', agent).catch(fail)).status).toBe(403)
      const layout = { is_default: true, configuration: { widgets: { prova: { hidden: true } } } }
      expect((await api.post('/admin/layouts/order.details/configuration', layout, agent).catch(fail)).status).toBe(403)
      expect((await api.post('/admin/rbac/roles', { name: 'Amministratore' }, agent).catch(fail)).status).toBe(403)
    })

    it('un tipo di anagrafica scritto con caratteri codificati non aggira i permessi', async () => {
      const agent = await adminWithRoles(getContainer(), 'bruno@test.local', [AGENT_ROLE_ID])
      for (const path of ['/admin/filiera/registries/supplier%73', '/admin/filiera/registries/grove%73']) {
        expect((await api.get(path, agent).catch(fail)).status).toBe(400)
      }
    })

    it('chi accetta un invito diventa l’utente con l’email dell’invito, non con quella che scrive', async () => {
      const users = getContainer().resolve(Modules.USER)
      const [invite] = await users.createInvites([{ email: 'giulia@test.local' }])
      const { data: registered } = await api.post('/auth/user/emailpass/register', { email: 'giulia@test.local', password: 'password-di-prova' })
      const accepted = await api.post(
        `/admin/invites/accept?token=${invite.token}`,
        { email: 'Bruno@test.local', first_name: 'Giulia' },
        { headers: { authorization: `Bearer ${registered.token}` } },
      )
      expect(accepted.data.user.email).toBe('giulia@test.local')
    })

    it('i clienti non possono registrarsi: il sito non ha account cliente', async () => {
      const response = await api.post('/auth/customer/emailpass/register', { email: 'chiunque@test.local', password: 'password-di-prova' }).catch(fail)
      expect(response.status).toBeGreaterThanOrEqual(400)
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
