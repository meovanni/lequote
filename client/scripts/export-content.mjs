// Scrive in server/src/modules/contenuti/defaults.generated.json l'elenco dei contenuti
// modificabili dal back office, con i testi di partenza (src/data/published/schema.ts). Va
// rilanciato quando cambiano i testi nel codice: lo ricorda il test di schema.test.ts.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const src = fileURLToPath(new URL('../src', import.meta.url))
const target = fileURLToPath(new URL('../../server/src/modules/contenuti/defaults.generated.json', import.meta.url))

const vite = await createServer({
  configFile: false,
  logLevel: 'error',
  resolve: { alias: { '@': src } },
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: 'custom',
  optimizeDeps: { noDiscovery: true, include: [] },
})
try {
  const { buildContentSchema, serializeSchema } = await vite.ssrLoadModule('/src/data/published/schema.ts')
  writeFileSync(target, serializeSchema(buildContentSchema()))
  console.log(`Contenuti modificabili scritti in ${target}`)
} finally {
  await vite.close()
}
