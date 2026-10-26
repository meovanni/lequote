import { useEffect, useState } from 'react'
import { listPublicAnalyses, type CampaignAnalyses } from '@/lib/medusa/analyses'
import type { ProductLine } from '@/types'

export type AnalysesState =
  | { status: 'loading' }
  | { status: 'ready'; campaigns: CampaignAnalyses[] }
  | { status: 'error' }

// Come prezzi e disponibilità: i valori delle analisi si leggono nel browser a ogni visita, così
// una correzione nel back office arriva sul sito senza rifare il build.
export function usePublicAnalyses(line?: ProductLine): AnalysesState {
  const [state, setState] = useState<AnalysesState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    listPublicAnalyses(line)
      .then((campaigns) => {
        if (!cancelled) setState({ status: 'ready', campaigns })
      })
      .catch((error: unknown) => {
        console.error(error)
        if (!cancelled) setState({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [line])

  return state
}
