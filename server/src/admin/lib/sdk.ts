import Medusa from '@medusajs/js-sdk'

// Il back office è servito dallo stesso server delle API: la sessione del login di Medusa basta.
export const sdk = new Medusa({
  baseUrl: import.meta.env.VITE_BACKEND_URL || '/',
  debug: import.meta.env.DEV,
  auth: { type: 'session' },
})
