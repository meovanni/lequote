import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { Prompt } from '@medusajs/ui'
import { useEffect } from 'react'
import { useBlocker } from 'react-router-dom'
import { useHasUnsavedChanges } from '../lib/unsaved-changes'

/**
 * Uscita da una pagina con moduli non salvati (lib/unsaved-changes): conferma prima di cambiare
 * pagina nel back office, avviso del browser prima di chiudere o ricaricare la scheda. Il router
 * ammette un solo blocco alla volta e Medusa ne usa uno nelle sue finestre di modifica: il nostro
 * esiste solo mentre c'è davvero qualcosa da salvare.
 */
const LeaveGuard = () => {
  const unsaved = useHasUnsavedChanges()

  useEffect(() => {
    if (!unsaved) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [unsaved])

  return unsaved ? <LeaveBlocker /> : null
}

function LeaveBlocker() {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => currentLocation.pathname !== nextLocation.pathname)

  return (
    <Prompt open={blocker.state === 'blocked'} variant="confirmation">
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>Uscire senza salvare?</Prompt.Title>
          <Prompt.Description>In questa pagina ci sono modifiche non salvate: uscendo andranno perse.</Prompt.Description>
        </Prompt.Header>
        <Prompt.Footer>
          <Prompt.Cancel type="button" onClick={() => blocker.reset?.()}>
            Resta nella pagina
          </Prompt.Cancel>
          <Prompt.Action type="button" onClick={() => blocker.proceed?.()}>
            Esci senza salvare
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  )
}

export const config = defineWidgetConfig({ zone: 'topbar' })

export default LeaveGuard
