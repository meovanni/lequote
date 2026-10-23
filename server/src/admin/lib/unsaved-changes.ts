import { useEffect, useId, useSyncExternalStore } from 'react'

// Modifiche non salvate nei moduli delle pagine (dati di etichetta, campagna, fasi, incassi...).
// Ogni modulo segnala qui se ha dati non salvati; il widget leave-guard chiede conferma prima di
// cambiare pagina o chiudere la scheda. I pannelli e le finestre usano invece useGuardedOpen.

const sources = new Set<string>()
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Da chiamare in un modulo di pagina: finché dirty è true, uscire dalla pagina chiede conferma. */
export function useUnsavedChanges(dirty: boolean) {
  const id = useId()
  useEffect(() => {
    if (!dirty) return
    sources.add(id)
    emit()
    return () => {
      sources.delete(id)
      emit()
    }
  }, [dirty, id])
}

/** true se almeno un modulo della pagina ha dati non salvati. */
export function useHasUnsavedChanges(): boolean {
  return useSyncExternalStore(subscribe, () => sources.size > 0)
}
