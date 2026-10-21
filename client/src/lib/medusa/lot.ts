import type { ProductLine } from '@/types'
import { STORE_BASE_URL, StoreApiError, storeFetch } from './client'

// Pagina pubblica di un lotto (/lotto/:codice), raggiunta dal QR in etichetta o dalla ricerca
// nella sezione Filiera. Medusa risponde solo con la proiezione pubblica: i dati interni non
// arrivano mai al browser (server/src/modules/filiera/lib/public-lot.ts).

export interface LotField {
  label: string
  value: string
}

export interface PublicLot {
  code: string
  productLine: ProductLine
  productName: string
  /** Campagna di raccolta, es. "2025/26". */
  campaign: string | null
  stages: { name: string; date: string | null; place: string | null; fields: LotField[] }[]
  legal: LotField[]
  analyses: { title: string; lab: string | null; date: string | null; url: string }[]
}

interface RawPublicLot {
  code: string
  product_line: ProductLine
  product_name: string
  campaign?: string | null
  stages?: PublicLot['stages'] | null
  legal?: LotField[] | null
  analyses?: PublicLot['analyses'] | null
}

/** I referti si scaricano dal back end, che ricontrolla la loro visibilità a ogni richiesta. */
export function toPublicLot(raw: RawPublicLot, baseUrl: string = STORE_BASE_URL): PublicLot {
  return {
    code: raw.code,
    productLine: raw.product_line,
    productName: raw.product_name,
    campaign: raw.campaign ?? null,
    stages: raw.stages ?? [],
    legal: raw.legal ?? [],
    analyses: (raw.analyses ?? []).map((analysis) => ({ ...analysis, url: `${baseUrl}${analysis.url}` })),
  }
}

/** Il lotto pubblicato con quel codice; null se non esiste o non è pubblicato (stessa risposta). */
export async function retrievePublicLot(code: string): Promise<PublicLot | null> {
  try {
    const { lot } = await storeFetch<{ lot: RawPublicLot }>(`/store/filiera/lots/${encodeURIComponent(code)}`)
    return toPublicLot(lot)
  } catch (error) {
    if (error instanceof StoreApiError && error.status === 404) return null
    throw error
  }
}
