import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { Heading, Text } from '@medusajs/ui'
import '@fontsource-variable/instrument-sans'
import '../theme/lequote.css'
import { Logo } from '../components/brand/logo'

// Tema Le Quote (src/admin/theme/lequote.css) e carattere del sito per tutto il back office: i
// fogli di stile si caricano con le estensioni, all'avvio. Nella pagina di accesso il widget mette
// logotipo e titolo di Le Quote al posto di quelli di Medusa (nascosti dal tema).
const LoginBrand = () => (
  <div className="lq-login-brand mb-2 flex flex-col items-center gap-4 text-center">
    <Logo className="h-9 w-auto text-ui-fg-base" />
    <div>
      <Heading>Area riservata</Heading>
      <Text size="small" className="text-ui-fg-subtle">
        Accedi con l’email e la password del tuo account.
      </Text>
    </div>
  </div>
)

export const config = defineWidgetConfig({ zone: 'login.before' })

export default LoginBrand
