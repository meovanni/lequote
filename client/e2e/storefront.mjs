// Vetrina per i test end-to-end: il server di sviluppo di React Router su E2E_STOREFRONT_PORT,
// collegato al Medusa dei test (server/scripts/e2e-backend.mjs) con la sua chiave pubblica.
// Lo lancia Playwright dopo il back end, che scrive e2e/.state/backend.json.
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const port = process.env.E2E_STOREFRONT_PORT ?? '5190'
const backend = JSON.parse(readFileSync(join(root, 'e2e', '.state', 'backend.json'), 'utf8'))

const server = spawn('npx', ['react-router', 'dev', '--port', port, '--strictPort'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    VITE_MEDUSA_PUBLISHABLE_KEY: backend.publishableKey,
    MEDUSA_PROXY_TARGET: backend.medusaUrl,
  },
})
const stop = () => server.kill()
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
server.on('exit', (code) => process.exit(code ?? 0))
