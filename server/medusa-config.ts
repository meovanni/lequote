import { defineConfig, FeatureFlag, loadEnv } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Ruoli e permessi di Medusa (ancora sperimentali in 2.21): defineConfig decide se caricare il
// modulo leggendo l'interruttore globale, che va acceso prima. Permessi nostri in src/policies.
process.env.MEDUSA_FF_RBAC ??= 'true'
FeatureFlag.setFlag('rbac', true)

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} non configurata: lancia "npm run setup" in sviluppo o impostala nell'ambiente.`)
  }
  return value
}

// Bonifico e pagamento al ritiro sempre attivi (src/modules/manual-payments); Stripe (carta) si
// aggiunge impostando la chiave.
const stripeApiKey = process.env.STRIPE_API_KEY

const stripeProvider = stripeApiKey
  ? [
      {
        resolve: '@medusajs/medusa/payment-stripe',
        id: 'stripe',
        options: {
          apiKey: stripeApiKey,
          webhookSecret: required('STRIPE_WEBHOOK_SECRET'),
        },
      },
    ]
  : []

const paymentModule = {
  resolve: '@medusajs/medusa/payment',
  options: {
    providers: [{ resolve: './src/modules/manual-payments', id: 'lequote' }, ...stripeProvider],
  },
}

// Email d'ordine tramite l'SMTP della casella esistente (ADR 0004). Senza SMTP_HOST, in
// sviluppo, le email si salvano in server/.mail invece di partire.
const notificationModule = {
  resolve: '@medusajs/medusa/notification',
  options: {
    providers: [
      {
        resolve: './src/modules/smtp-notification',
        id: 'smtp',
        options: {
          channels: ['email'],
          host: process.env.SMTP_HOST || undefined,
          port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
          secure: process.env.SMTP_SECURE === 'true',
          user: process.env.SMTP_USER || undefined,
          pass: process.env.SMTP_PASS || undefined,
          from: process.env.SMTP_FROM || 'Le Quote <info@le-quote.it>',
          // Dove salvare le email senza SMTP_HOST (i test end-to-end usano server/.mail-e2e).
          previewDir: process.env.MAIL_PREVIEW_DIR || undefined,
        },
      },
    ],
  },
}

module.exports = defineConfig({
  featureFlags: { rbac: true },
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
  modules: [{ resolve: './src/modules/filiera' }, { resolve: './src/modules/recesso' }, { resolve: './src/modules/vendite' }, { resolve: './src/modules/magazzino' }, { resolve: './src/modules/contenuti' }, paymentModule, notificationModule],
})
