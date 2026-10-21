import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Scrive in client/.env.local la chiave pubblica della vetrina creata dal seed, così il sito in
// sviluppo legge prezzi e disponibilità senza copiarla a mano. La chiave pubblica è fatta per
// stare nel browser (identifica il canale di vendita, non dà accesso al back office).
const KEY = 'VITE_MEDUSA_PUBLISHABLE_KEY'

export default async function storefrontEnv({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const keys = await container.resolve(Modules.API_KEY).listApiKeys({ type: 'publishable' })
  const active = keys.filter((k) => !k.revoked_at)
  const key = active.find((k) => k.title === 'Vetrina') ?? active[0]
  if (!key) {
    logger.error('Nessuna chiave pubblica: lancia prima "npm run seed".')
    process.exitCode = 1
    return
  }

  const file = join(process.cwd(), '..', 'client', '.env.local')
  const lines = existsSync(file) ? readFileSync(file, 'utf8').split(/\r?\n/).filter((line) => line && !line.startsWith(`${KEY}=`)) : []
  writeFileSync(file, [...lines, `${KEY}=${key.token}`, ''].join('\n'))
  logger.info(`Chiave della vetrina scritta in ${file}`)
}
