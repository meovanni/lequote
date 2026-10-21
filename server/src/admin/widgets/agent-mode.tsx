import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { sdk } from '../lib/sdk'

// Il back office di Medusa mostra a tutti le stesse voci di menu, anche quelle che il ruolo non
// può aprire (le API rispondono 403). Per chi ha solo l'area vendita (ruolo Agente) questo widget,
// presente in cima a ogni pagina, nasconde le altre voci e riporta a /app/sell. I permessi veri
// restano quelli del server: qui si sistema solo cosa si vede.
// Restano visibili l'area vendita, la voce Impostazioni (che per l'agente apre il profilo) e il
// profilo stesso; nelle impostazioni si nascondono le sezioni che non contengono il profilo.
const AGENT_CSS = `
  nav a[href]:not([href$="/sell"]):not([href$="/settings"]):not([href$="/settings/profile"]) { display: none !important; }
  aside a[href*="/settings/"]:not([href$="/settings/profile"]) { display: none !important; }
  aside div.py-3[data-state]:not(:has(a[href$="/settings/profile"])),
  aside div.py-3[data-state]:not(:has(a[href$="/settings/profile"])) + div:has(> [role="separator"]) { display: none !important; }
  [role="menu"] a[href$="/settings/store"] { display: none !important; }
`
const STYLE_ID = 'lequote-agent-mode'

/** Pagine che l'agente può aprire: la sua area e il suo profilo (per la password e l'uscita). */
const allowed = (path: string) => path.startsWith('/sell') || path.startsWith('/settings/profile')

/** Il link "Impostazioni" del menu porta a /settings, che Medusa gira subito sulle impostazioni del negozio. */
const isSettingsHome = (href: string) => /\/settings\/?$/.test(new URL(href, window.location.href).pathname)

/**
 * Lo stile sta nell'head e non nel widget: così resta attivo anche mentre il back office cambia
 * layout (impostazioni) o carica una pagina, e le voci nascoste non compaiono nemmeno per un attimo.
 */
function useAgentStyle(active: boolean) {
  useEffect(() => {
    const existing = document.getElementById(STYLE_ID)
    if (!active) {
      existing?.remove()
      return
    }
    if (existing) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = AGENT_CSS
    document.head.appendChild(style)
  }, [active])
}

/** Per l'agente "Impostazioni" apre direttamente il profilo, senza passare dalle impostazioni del negozio. */
function useSettingsShortcut(active: boolean, pathname: string) {
  const navigate = useNavigate()
  useEffect(() => {
    if (!active) return
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href]')
      if (!link || !isSettingsHome(link.getAttribute('href') ?? '')) return
      event.preventDefault()
      event.stopPropagation()
      navigate('/settings/profile', { state: { from: pathname } })
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [active, pathname, navigate])
}

const AgentMode = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { data } = useQuery({
    queryKey: ['me-permissions'],
    staleTime: 5 * 60 * 1000,
    queryFn: () => sdk.client.fetch<{ permissions: string[] }>('/admin/rbac/me/permissions'),
  })
  const permissions = data?.permissions ?? []
  const agentOnly = permissions.includes('sales:read') && !permissions.includes('order:read')

  useAgentStyle(agentOnly)
  useSettingsShortcut(agentOnly, pathname)

  useEffect(() => {
    if (agentOnly && !allowed(pathname)) navigate('/sell', { replace: true })
  }, [agentOnly, pathname, navigate])

  return null
}

export const config = defineWidgetConfig({ zone: 'topbar' })

export default AgentMode
