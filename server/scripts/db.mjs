// Postgres locale per lo sviluppo su Windows, senza Docker né installazioni di sistema:
// embedded-postgres scarica i binari ufficiali e tiene i dati in server/.pgdata.
// Resta in primo piano finché non lo si ferma con Ctrl+C. In produzione Postgres gira in Docker.
import EmbeddedPostgres from 'embedded-postgres'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = join(root, '.env')

if (!existsSync(envPath)) {
  console.error('Manca server/.env: lancia prima "npm run setup".')
  process.exit(1)
}
process.loadEnvFile(envPath)

const { DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env
const dataDir = join(root, '.pgdata')
const firstRun = !existsSync(join(dataDir, 'PG_VERSION'))

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: DB_USER,
  password: DB_PASSWORD,
  port: Number(DB_PORT),
  persistent: true,
  // Senza questi flag initdb eredita la codifica di Windows (WIN1252) e Postgres rifiuta i
  // caratteri non latini, per esempio i simboli delle valute caricati da Medusa.
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
  onLog: () => {},
  onError: (message) => console.error(String(message)),
})

async function stop() {
  await pg.stop()
  process.exit(0)
}

try {
  if (firstRun) await pg.initialise()
  await pg.start()
  if (firstRun) await pg.createDatabase(DB_NAME)
  console.log(`Postgres pronto su localhost:${DB_PORT}, database "${DB_NAME}". Ctrl+C per fermarlo.`)
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
} catch (error) {
  console.error('Avvio di Postgres non riuscito:', error)
  await pg.stop().catch(() => {})
  process.exit(1)
}
