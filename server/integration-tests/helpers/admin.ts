import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import jwt from 'jsonwebtoken'
import { SUPER_ADMIN_ROLE_ID } from '../../src/lib/roles'

/**
 * Utente del back office con i suoi ruoli e il token che Medusa gli darebbe al login: con i ruoli
 * attivi i permessi si leggono da app_metadata.roles del token.
 */
export async function adminWithRoles(
  container: MedusaContainer,
  email: string,
  roles: string[] = [SUPER_ADMIN_ROLE_ID],
): Promise<{ userId: string; headers: Record<string, string> }> {
  const user = await container.resolve(Modules.USER).createUsers({ email })
  const identity = await container.resolve(Modules.AUTH).createAuthIdentities({
    provider_identities: [{ provider: 'emailpass', entity_id: email }],
    app_metadata: { user_id: user.id },
  })
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  for (const role of roles) {
    await link.create({ [Modules.USER]: { user_id: user.id }, [Modules.RBAC]: { rbac_role_id: role } })
  }
  const token = jwt.sign(
    { actor_id: user.id, actor_type: 'user', auth_identity_id: identity.id, app_metadata: { user_id: user.id, roles } },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' },
  )
  return { userId: user.id, headers: { authorization: `Bearer ${token}` } }
}
