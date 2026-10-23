import { toast, usePrompt } from '@medusajs/ui'
import { useState } from 'react'

type GuardOptions = {
  /** Ci sono dati inseriti e non salvati. */
  dirty: boolean
  /** Cancella i dati del modulo: si chiama a ogni chiusura (dopo la conferma, se serve). */
  onDiscard: () => void
  /** Operazione in corso che non si può interrompere: la chiusura è bloccata con questo messaggio. */
  busy?: string | null
}

/**
 * Apertura e chiusura di un pannello o di una finestra con un modulo (Drawer, FocusModal). Chiudere
 * con un clic fuori, Esc, la X o "Annulla" con dati inseriti chiede conferma; se si esce, i dati si
 * cancellano, così alla riapertura il modulo è vuoto. Dopo un salvataggio riuscito si usa close().
 */
export function useGuardedOpen({ dirty, onDiscard, busy = null }: GuardOptions) {
  const [open, setOpen] = useState(false)
  const prompt = usePrompt()

  const close = () => {
    onDiscard()
    setOpen(false)
  }

  const onOpenChange = async (next: boolean) => {
    if (next) {
      setOpen(true)
      return
    }
    if (busy) {
      toast.info(busy)
      return
    }
    if (dirty) {
      const confirmed = await prompt({
        title: 'Uscire senza salvare?',
        description: 'I dati inseriti andranno persi.',
        confirmText: 'Esci e cancella',
        cancelText: 'Continua',
      })
      if (!confirmed) return
    }
    close()
  }

  // Con Esc la conferma si aprirebbe durante lo stesso tasto e si richiuderebbe subito: si ferma la
  // chiusura immediata e la si chiede subito dopo. Da passare a Drawer.Content / FocusModal.Content.
  const contentProps = {
    onEscapeKeyDown: (event: KeyboardEvent) => {
      event.preventDefault()
      setTimeout(() => void onOpenChange(false), 0)
    },
  }

  return { open, onOpenChange, close, contentProps }
}
