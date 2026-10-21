/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { reactRouter } from '@react-router/dev/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  // Il plugin di React Router non gira dentro Vitest: i test montano i componenti da soli.
  plugins: [process.env.VITEST ? react() : reactRouter()],
  // Le chiamate alla Store API e i referti pubblici delle analisi vanno a Medusa (porta 9000)
  // dallo stesso indirizzo della vetrina: niente CORS, e il sito funziona anche aperto dal
  // telefono sulla rete locale (così si prova anche il QR del lotto).
  server: {
    proxy: { '/store': 'http://localhost:9000', '/filiera': 'http://localhost:9000' },
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
  },
})
