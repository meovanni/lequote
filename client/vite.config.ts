/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { reactRouter } from '@react-router/dev/vite'
import { fileURLToPath, URL } from 'node:url'

const medusaTarget = process.env.MEDUSA_PROXY_TARGET ?? 'http://localhost:9000'

// https://vite.dev/config/
export default defineConfig({
  // Il plugin di React Router non gira dentro Vitest: i test montano i componenti da soli.
  plugins: [process.env.VITEST ? react() : reactRouter()],
  // Le chiamate alla Store API e i referti pubblici delle analisi vanno a Medusa (porta 9000)
  // dallo stesso indirizzo della vetrina: niente CORS, e il sito funziona anche aperto dal
  // telefono sulla rete locale (così si prova anche il QR del lotto).
  // I test end-to-end puntano a un Medusa separato con MEDUSA_PROXY_TARGET.
  server: {
    proxy: { '/store': medusaTarget, '/filiera': medusaTarget },
  },
  // La scena 3D di Territorio si importa in modo pigro: senza questo Vite scopre three e la
  // fiber solo a pagina aperta, rifà il bundle delle dipendenze e la pagina resta con due React.
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/postprocessing', 'postprocessing'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
    // client/e2e sono test Playwright: li lancia "npm run test:e2e", non Vitest.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
