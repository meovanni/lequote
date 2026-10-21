// Medusa per i test end-to-end (client/e2e): database "<DB_NAME>_e2e" ricreato da zero sullo
// stesso Postgres di sviluppo, migrazioni, catalogo, giacenze e lotto di prova, poi il server su
// E2E_MEDUSA_PORT (9200). I dati di sviluppo non vengono toccati. Le email finiscono in
// server/.mail-e2e. Serve "npm run db" acceso. Lo lancia Playwright: non serve chiamarlo a mano.
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))
const { Client } = require('pg')

process.loadEnvFile(join(root, '.env'))

const port = process.env.E2E_MEDUSA_PORT ?? '9200'
const storefront = process.env.E2E_STOREFRONT_URL ?? 'http://localhost:5190'
const mailDir = join(root, '.mail-e2e')
const stateFile = join(root, '..', 'client', 'e2e', '.state', 'backend.json')

const devUrl = new URL(process.env.DATABASE_URL)
const dbName = `${devUrl.pathname.slice(1)}_e2e`
const e2eUrl = new URL(devUrl)
e2eUrl.pathname = `/${dbName}`
const maintenanceUrl = new URL(devUrl)
maintenanceUrl.pathname = '/postgres'

const env = {
  ...process.env,
  NODE_ENV: 'development',
  DATABASE_URL: e2eUrl.toString(),
  PORT: port,
  STOREFRONT_URL: storefront,
  STORE_CORS: storefront,
  // Niente invii veri: le email si salvano su file, dove i test le leggono.
  SMTP_HOST: '',
  MAIL_PREVIEW_DIR: mailDir,
  // Le email ai titolari vanno qui, così i test le distinguono da quelle ai clienti.
  ORDER_ALERT_EMAIL: 'titolari@e2e.test',
}

async function recreateDatabase() {
  const client = new Client({ connectionString: maintenanceUrl.toString() })
  try {
    await client.connect()
  } catch (error) {
    throw new Error(`Postgres non raggiungibile: lancia "npm run db" in server/ (${error.message})`)
  }
  try {
    await client.query('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()', [dbName])
    await client.query(`DROP DATABASE IF EXISTS "${dbName}"`)
    await client.query(`CREATE DATABASE "${dbName}"`)
  } finally {
    await client.end()
  }
}

function medusa(...args) {
  const result = spawnSync('npx', ['medusa', ...args], { cwd: root, env, stdio: 'inherit', shell: true })
  if (result.status !== 0) throw new Error(`medusa ${args.join(' ')} non riuscito (codice ${result.status})`)
}

async function publishableKey() {
  const client = new Client({ connectionString: e2eUrl.toString() })
  await client.connect()
  try {
    const { rows } = await client.query(
      "SELECT token FROM api_key WHERE type = 'publishable' AND title = 'Vetrina' AND revoked_at IS NULL AND deleted_at IS NULL LIMIT 1",
    )
    if (!rows[0]) throw new Error('Il seed non ha creato la chiave pubblica "Vetrina".')
    return rows[0].token
  } finally {
    await client.end()
  }
}

await recreateDatabase()
if (existsSync(mailDir)) rmSync(mailDir, { recursive: true })
mkdirSync(mailDir, { recursive: true })
medusa('db:migrate')
medusa('exec', './src/scripts/seed.ts')
medusa('exec', './src/scripts/dev-stock.ts')
medusa('exec', './src/scripts/dev-lot.ts')

mkdirSync(dirname(stateFile), { recursive: true })
writeFileSync(stateFile, JSON.stringify({ publishableKey: await publishableKey(), medusaUrl: `http://localhost:${port}`, mailDir }, null, 2))

const server = spawn('npx', ['medusa', 'develop', '--port', port], { cwd: root, env, stdio: 'inherit', shell: true })
const stop = () => server.kill()
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
server.on('exit', (code) => process.exit(code ?? 0))
