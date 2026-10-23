import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { Heading, Text } from '@medusajs/ui'
import '@fontsource-variable/instrument-sans'
import '../theme/lequote.css'
import { Logo } from '../components/brand/logo'

// Tema Le Quote (src/admin/theme/lequote.css) e carattere del sito per tutto il back office: i
// fogli di stile si caricano con le estensioni, all'avvio. Nella pagina di accesso il widget mette
// logotipo e titolo di Le Quote al posto di quelli di Medusa (nascosti dal tema).

// Medusa segue il tema del sistema: su un computer in modalità scura il gestionale si apriva scuro.
// Una sola volta per browser (segnata da DEFAULT_SET) si parte in chiaro; poi vale la scelta fatta
// dal profilo. Il modulo si carica prima che Medusa legga la preferenza, quindi niente ricarica.
const THEME_KEY = 'medusa_admin_theme'
const DEFAULT_SET = 'lequote.tema-predefinito'
try {
  if (!localStorage.getItem(DEFAULT_SET)) {
    localStorage.setItem(DEFAULT_SET, '1')
    localStorage.setItem(THEME_KEY, 'light')
  }
} catch {
  // Storage bloccato: resta il tema del sistema, si cambia dal profilo.
}
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
