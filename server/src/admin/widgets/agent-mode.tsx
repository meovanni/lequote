import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { sdk } from '../lib/sdk'

// Il back office di Medusa mostra a tutti le stesse voci di menu, anche quelle che il ruolo non
// può aprire (le API rispondono 403). Per chi ha solo l'area vendita (ruolo Agente) questo widget,
// presente in cima a ogni pagina, nasconde le altre voci e riporta a /app/sell. I permessi veri
// restano quelli del server: qui si sistema solo cosa si vede.
const AGENT_CSS = `
  nav a[href]:not([href$="/sell"]):not([href*="/settings"]) { display: none !important; }
`

/** Pagine che l'agente può aprire: la sua area e il suo profilo (per la password e l'uscita). */
const allowed = (path: string) => path.startsWith('/sell') || path.startsWith('/settings/profile')

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

  useEffect(() => {
    if (agentOnly && !allowed(pathname)) navigate('/sell', { replace: true })
  }, [agentOnly, pathname, navigate])

  return agentOnly ? <style>{AGENT_CSS}</style> : null
}

export const config = defineWidgetConfig({ zone: 'topbar' })

export default AgentMode
