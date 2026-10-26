import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { Switch, Label } from '@medusajs/ui'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { sdk } from '../lib/sdk'

// Back office semplice per i titolari: il lavoro di ogni giorno sta nella pagina Gestione, quindi
// le schermate tecniche di Medusa (ordini, prodotti, inventario, clienti, promozioni, listini)
// spariscono dal menu e l'ingresso porta a Gestione. L'interruttore "Strumenti avanzati" in alto le
// rimette, per chi deve proprio usarle; la scelta resta su questo browser.
const HIDDEN = ['orders', 'products', 'inventory', 'customers', 'promotions', 'price-lists']
const SIMPLE_CSS = HIDDEN.map((path) => `nav a[href$="/${path}"]`).join(', ') + ' { display: none !important; }'
const STYLE_ID = 'lequote-simple-mode'
const STORAGE_KEY = 'lequote-advanced'

function readAdvanced(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function writeAdvanced(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
  } catch {
    // Senza memoria del browser la scelta vale solo per questa visita.
  }
}

function useSimpleStyle(active: boolean) {
  useEffect(() => {
    const existing = document.getElementById(STYLE_ID)
    if (!active) {
      existing?.remove()
      return
    }
    if (existing) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = SIMPLE_CSS
    document.head.appendChild(style)
  }, [active])
}

const SimpleMode = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [advanced, setAdvanced] = useState(readAdvanced)
  const { data } = useQuery({
    queryKey: ['me-permissions'],
    staleTime: 5 * 60 * 1000,
    queryFn: () => sdk.client.fetch<{ permissions: string[] }>('/admin/rbac/me/permissions'),
  })
  // Solo chi gestisce gli ordini: gli agenti hanno la loro area (agent-mode.tsx).
  const owner = (data?.permissions ?? []).includes('order:read')

  useSimpleStyle(owner && !advanced)
  useEffect(() => {
    // L'ingresso del back office (l'elenco ordini di Medusa) porta alla pagina Gestione.
    if (owner && !advanced && (pathname === '/' || pathname === '/orders')) navigate('/gestione', { replace: true })
  }, [owner, advanced, pathname, navigate])

  if (!owner) return null
  return (
    <div className="flex items-center gap-2">
      <Switch
        id="lequote-advanced"
        checked={advanced}
        onCheckedChange={(checked) => {
          writeAdvanced(checked)
          setAdvanced(checked)
        }}
      />
      <Label htmlFor="lequote-advanced" size="xsmall" className="text-ui-fg-subtle">
        Strumenti avanzati
      </Label>
    </div>
  )
}

export const config = defineWidgetConfig({ zone: 'topbar' })

export default SimpleMode
