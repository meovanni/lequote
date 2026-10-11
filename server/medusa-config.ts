import { defineConfig, loadEnv } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} non configurata: lancia "npm run setup" in sviluppo o impostala nell'ambiente.`)
  }
  return value
}

// Stripe è facoltativo: senza chiave restano i soli pagamenti manuali (bonifico, al ritiro).
const stripeApiKey = process.env.STRIPE_API_KEY

const paymentModule = stripeApiKey
  ? [
      {
        resolve: '@medusajs/medusa/payment',
        options: {
          providers: [
            {
              resolve: '@medusajs/medusa/payment-stripe',
              id: 'stripe',
              options: {
                apiKey: stripeApiKey,
                webhookSecret: required('STRIPE_WEBHOOK_SECRET'),
              },
            },
          ],
        },
      },
    ]
  : []

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: required('DATABASE_URL'),
    // Senza REDIS_URL Medusa usa event bus, cache e lock in memoria: va bene in sviluppo.
    redisUrl: process.env.REDIS_URL || undefined,
    http: {
      storeCors: required('STORE_CORS'),
      adminCors: required('ADMIN_CORS'),
      authCors: required('AUTH_CORS'),
      jwtSecret: required('JWT_SECRET'),
      cookieSecret: required('COOKIE_SECRET'),
    },
  },
  modules: [{ resolve: './src/modules/filiera' }, ...paymentModule],
})
