import { parseLotCode } from './lot-code'
import { nominalQuantities, type LotPackage } from './lot-label'

// Un lotto diventa pubblico (pagina /lotto e QR) solo con i dati obbligatori di etichetta
// completi (Reg. UE 1169/2011 art. 9; D.Lgs. 231/2017 art. 17). La stessa regola blocca la
// stampa delle etichette (ADR 0005): meglio un lotto fermo in bozza che un'etichetta incompleta.

export type PublishCandidate = {
  code: string
  product_name: string | null
  origin: string | null
  packages: LotPackage[] | null
  best_before: Date | string | null
  campaign_id: string | null
  packaging_establishment_id: string | null
  stages: { name: string; fields: { label: string; required?: boolean; value: string | number | null }[] }[]
}

const filled = (value: unknown) => value !== null && value !== undefined && String(value).trim() !== ''

/** Etichette dei dati mancanti, in ordine di etichetta; vuoto se il lotto è pubblicabile. */
export function publishBlockers(lot: PublishCandidate): string[] {
  const required: [string, unknown][] = [
    ['Denominazione', lot.product_name],
    ['Origine', lot.origin],
    // La quantità nominale in etichetta è la misura delle confezioni: serve almeno un formato.
    ['Confezioni del lotto (quantità nominale)', nominalQuantities(lot.packages, 'olio')],
    ['Termine minimo di conservazione', lot.best_before],
    ['Campagna', lot.campaign_id],
    ['Stabilimento di confezionamento', lot.packaging_establishment_id],
  ]

  const blockers = required.filter(([, value]) => !filled(value)).map(([label]) => label)

  if (!parseLotCode(lot.code).ok) blockers.unshift('Codice lotto valido')
  if (lot.stages.length === 0) blockers.push('Almeno una fase di filiera')

  for (const stage of lot.stages) {
    for (const field of stage.fields) {
      if (field.required && !filled(field.value)) blockers.push(`${stage.name}: ${field.label}`)
    }
  }

  return blockers
}
