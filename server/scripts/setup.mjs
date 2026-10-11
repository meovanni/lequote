// Crea server/.env da .env.template con segreti casuali. Non sovrascrive un .env esistente:
// cambiare la password del database dopo l'inizializzazione renderebbe illeggibile .pgdata.
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = join(root, '.env')

if (existsSync(envPath)) {
  console.log('.env esiste già: nessuna modifica.')
  process.exit(0)
}

const secret = () => randomBytes(32).toString('base64url')
const filled = readFileSync(join(root, '.env.template'), 'utf8').replace(/__GENERA__/g, secret)

const values = Object.fromEntries(
  filled
    .split(/\r?\n/)
    .filter((line) => /^[A-Z_]+=/.test(line))
    .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]),
)
const databaseUrl = `postgres://${values.DB_USER}:${values.DB_PASSWORD}@localhost:${values.DB_PORT}/${values.DB_NAME}`

writeFileSync(envPath, filled.replace('__DATABASE_URL__', databaseUrl))
console.log('.env creato con segreti casuali.')
