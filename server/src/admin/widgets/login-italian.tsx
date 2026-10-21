import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { useEffect } from 'react'

// Il back office sceglie la lingua solo da una preferenza salvata (cookie "lng", poi localStorage),
// mai da quella del browser, e al primo avvio salva da sé "en". Una sola volta per browser
// (segnata da DEFAULT_SET) imposta l'italiano e ricarica; poi vale la scelta fatta dal profilo.
const LANGUAGE_KEY = 'lng'
const DEFAULT_SET = 'lequote.lingua-predefinita'

const LoginItalian = () => {
  useEffect(() => {
    try {
      if (localStorage.getItem(DEFAULT_SET)) return
      localStorage.setItem(DEFAULT_SET, '1')
      if (localStorage.getItem(LANGUAGE_KEY) === 'it') return
      // Il cookie ha la precedenza sul localStorage: vanno scritti entrambi.
      document.cookie = `${LANGUAGE_KEY}=it; path=/; max-age=31536000; SameSite=Lax`
      localStorage.setItem(LANGUAGE_KEY, 'it')
      window.location.reload()
    } catch {
      // Storage bloccato: resta la lingua predefinita, si cambia dal profilo.
    }
  }, [])
  return null
}

export const config = defineWidgetConfig({ zone: 'login.before' })

export default LoginItalian
