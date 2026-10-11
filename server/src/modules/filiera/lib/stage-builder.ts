import type { StageFieldValue, Visibility } from './public-lot'

// Le fasi di un lotto si costruiscono sul server a partire dai modelli: dal back office arrivano
// solo i valori. Etichette, visibilità e obbligatorietà non si possono alterare dal browser,
// altrimenti basterebbe una richiesta modificata per rendere facoltativo un campo obbligatorio
// o pubblico un campo interno.

export type TemplateForBuild = {
  id: string
  product_line: 'olio' | 'miele'
  name: string
  position: number
  fields: { key: string; label: string; type: 'text' | 'number' | 'date'; visibility: Visibility; required: boolean }[]
}

export type StageValuesInput = {
  template_id: string
  date: Date | null
  place: string | null
  values: Record<string, string | number | null>
}

export type BuiltStage = {
  template_id: string
  name: string
  position: number
  date: Date | null
  place: string | null
  fields: StageFieldValue[]
}

export type BuildResult = { ok: true; stages: BuiltStage[] } | { ok: false; error: string }

export function buildLotStages(
  productLine: 'olio' | 'miele',
  templates: TemplateForBuild[],
  inputs: StageValuesInput[],
): BuildResult {
  const byId = new Map(templates.filter((t) => t.product_line === productLine).map((t) => [t.id, t]))
  const seen = new Set<string>()
  const stages: BuiltStage[] = []

  for (const input of inputs) {
    const template = byId.get(input.template_id)
    if (!template) return { ok: false, error: `Modello di fase sconosciuto: ${input.template_id}.` }
    if (seen.has(template.id)) return { ok: false, error: `La fase ${template.name} è ripetuta.` }
    seen.add(template.id)

    const known = new Set(template.fields.map((field) => field.key))
    const unknown = Object.keys(input.values).find((key) => !known.has(key))
    if (unknown) return { ok: false, error: `La fase ${template.name} non prevede il campo «${unknown}».` }

    stages.push({
      template_id: template.id,
      name: template.name,
      position: template.position,
      date: input.date,
      place: input.place,
      fields: template.fields.map(({ key, label, visibility, required }) => ({
        key,
        label,
        visibility,
        required,
        value: input.values[key] ?? null,
      })),
    })
  }

  return { ok: true, stages: stages.sort((a, b) => a.position - b.position) }
}
