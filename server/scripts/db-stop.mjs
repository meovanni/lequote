// Ferma il Postgres locale avviato da "npm run db" quando non lo si può chiudere con Ctrl+C
// (per esempio se il terminale è stato chiuso e il processo è rimasto attivo).
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
// Il pacchetto non esporta package.json, quindi niente require.resolve: si va alla cartella.
const platform = process.platform === 'win32' ? 'windows' : process.platform
const binDir = join(root, 'node_modules', '@embedded-postgres', `${platform}-x64`, 'native', 'bin')

try {
  execFileSync(join(binDir, 'pg_ctl'), ['stop', '-D', join(root, '.pgdata'), '-m', 'fast'], { stdio: 'inherit' })
} catch {
  console.log('Postgres non era in esecuzione.')
}
