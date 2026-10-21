import { defineConfig, devices } from '@playwright/test'

// Test end-to-end: "npm run test:e2e" da client/, con Postgres di sviluppo acceso ("npm run db" in
// server/). Playwright avvia un Medusa su un database separato e ricreato a ogni giro (porta 9200)
// e la vetrina collegata a quello (porta 5190): i dati di sviluppo non vengono toccati.
const STOREFRONT_PORT = 5190
const MEDUSA_PORT = 9200

export default defineConfig({
  testDir: './e2e',
  // I test condividono lo stesso Medusa: in fila, così le giacenze e i limiti restano prevedibili.
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${STOREFRONT_PORT}`,
    locale: 'it-IT',
    timezoneId: 'Europe/Rome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'telefono', use: { ...devices['Pixel 7'] } },
  ],
  // In ordine: il back end prepara il database e scrive la chiave pubblica, poi parte la vetrina.
  webServer: [
    {
      command: 'node ../server/scripts/e2e-backend.mjs',
      url: `http://localhost:${MEDUSA_PORT}/health`,
      env: { E2E_MEDUSA_PORT: String(MEDUSA_PORT), E2E_STOREFRONT_URL: `http://localhost:${STOREFRONT_PORT}` },
      reuseExistingServer: false,
      timeout: 600_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'node e2e/storefront.mjs',
      url: `http://localhost:${STOREFRONT_PORT}/`,
      env: { E2E_STOREFRONT_PORT: String(STOREFRONT_PORT) },
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
})
