// Ferma il Postgres locale avviato da "npm run db" quando non lo si può chiudere con Ctrl+C
// (per esempio se il terminale è stato chiuso e il processo è rimasto attivo).
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const binDir = join(dirname(require.resolve(`@embedded-postgres/${process.platform === 'win32' ? 'windows' : process.platform}-x64/package.json`)), 'native', 'bin')

try {
  execFileSync(join(binDir, 'pg_ctl'), ['stop', '-D', join(root, '.pgdata'), '-m', 'fast'], { stdio: 'inherit' })
} catch {
  console.log('Postgres non era in esecuzione.')
}
