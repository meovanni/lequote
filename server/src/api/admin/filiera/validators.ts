import { z } from '@medusajs/framework/zod'
import { parseLotCode } from '../../../modules/filiera/lib/lot-code'

// Schemi delle richieste del back office per la filiera. Le date arrivano come "AAAA-MM-GG".

const productLine = z.enum(['olio', 'miele'])
const visibility = z.enum(['public', 'legal', 'internal'])
const text = z.string().trim().min(1).max(500)
const optionalText = z.string().trim().max(2000).nullish()
const id = z.string().trim().min(1).max(100)
const smallInt = z.number().int().min(0).max(1_000_000)

// Data di calendario reale: "2026-02-31" non diventa in silenzio il 3 marzo.
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data nel formato AAAA-MM-GG')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  }, 'Data inesistente')
  .transform((value) => new Date(`${value}T00:00:00Z`))
  .nullish()

const lotCode = z.string().transform((value, ctx) => {
  const parsed = parseLotCode(value)
  if (!parsed.ok) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Codice lotto non valido (es. L2026-01).' })
    return z.NEVER
  }
  return parsed.code
})

/** Se entrambe le date sono nel corpo, la seconda non può precedere la prima. */
function ordered<T extends Record<string, unknown>>(first: keyof T, second: keyof T, message: string) {
  return (data: T, ctx: z.RefinementCtx) => {
    const a = data[first]
    const b = data[second]
    if (a instanceof Date && b instanceof Date && b < a) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [String(second)], message })
    }
  }
}

const lotFields = {
  product_line: productLine,
  product_name: text,
  nominal_quantity: z.string().trim().max(50).nullish(),
  origin: z.string().trim().min(1).max(100).optional(),
  packaging_date: isoDate,
  best_before: isoDate,
  units: smallInt.nullish(),
  notes: optionalText,
  campaign_id: id,
  packaging_establishment_id: id.nullish(),
}

const lotDates = ordered('packaging_date', 'best_before', 'Il termine di conservazione precede il confezionamento.')

export const LotCreate = z.object({ code: lotCode, ...lotFields }).strict().superRefine(lotDates)
export const LotUpdate = z.object({ code: lotCode.optional(), ...lotFields }).partial().strict().superRefine(lotDates)

// Solo i valori: nome, etichette, visibilità e obbligatorietà li impone il modello (lib/stage-builder.ts).
export const LotStagesReplace = z
  .object({
    stages: z
      .array(
        z
          .object({
            template_id: id,
            date: isoDate,
            place: z.string().trim().max(200).nullish(),
            values: z.record(
              z.string().regex(/^[a-z][a-z0-9_]{0,39}$/),
              z.union([z.string().trim().max(2000), z.number().finite()]).nullable(),
            ),
          })
          .strict(),
      )
      .max(30),
  })
  .strict()

const campaignFields = {
  product_line: productLine,
  label: z.string().trim().min(1).max(50),
  harvest_start: isoDate,
  harvest_end: isoDate,
  notes: optionalText,
  mill_id: id.nullish(),
  grove_ids: z.array(id).max(100).optional(),
  apiary_ids: z.array(id).max(100).optional(),
}

const campaignDates = ordered('harvest_start', 'harvest_end', 'La fine precede l\'inizio.')

export const CampaignCreate = z.object(campaignFields).strict().superRefine(campaignDates)
export const CampaignUpdate = z.object(campaignFields).partial().strict().superRefine(campaignDates)

// Il referto arriva in base64 dentro il JSON e finisce nell'archivio privato, mai in static/.
// 15 MB di file sono circa 20 MB di base64: il limite del corpo è in middlewares.ts.
export const AnalysisCreate = z
  .object({
    title: text,
    lab: z.string().trim().max(200).nullish(),
    date: isoDate,
    visibility: z.enum(['public', 'internal']).default('internal'),
    file_base64: z.string().min(1).max(21 * 1024 * 1024),
  })
  .strict()

const province = z.string().trim().max(4).nullish()
const elevation = z.number().int().min(-500).max(5000).nullish()
const place = { name: text, municipality: text, province, notes: optionalText }

export const RegistrySchemas = {
  groves: z
    .object({
      ...place,
      elevation_m: elevation,
      area_ha: z.number().min(0).max(100_000).nullish(),
      cultivars: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
      sian_code: optionalText,
    })
    .strict(),
  apiaries: z
    .object({ ...place, elevation_m: elevation, hive_count: smallInt.nullish(), bda_code: optionalText })
    .strict(),
  mills: z.object({ ...place, address: optionalText, vat_number: optionalText }).strict(),
  establishments: z
    .object({
      name: text,
      role: z.enum(['imbottigliamento', 'invasettamento', 'laboratorio']),
      municipality: text,
      province,
      address: optionalText,
      internal_code: optionalText,
    })
    .strict(),
}

export type RegistryKind = keyof typeof RegistrySchemas

const stageTemplateFields = {
  product_line: productLine,
  name: z.string().trim().min(1).max(100),
  position: z.number().int().min(0).max(100),
  description: optionalText,
  active: z.boolean().optional(),
  fields: z
    .array(
      z.object({
        key: z.string().regex(/^[a-z][a-z0-9_]{0,39}$/, 'Chiave: minuscole, cifre e trattino basso'),
        label: z.string().trim().min(1).max(100),
        type: z.enum(['text', 'number', 'date']),
        visibility,
        required: z.boolean(),
      }),
    )
    .max(30)
    .refine((fields) => new Set(fields.map((field) => field.key)).size === fields.length, 'Chiavi di campo ripetute'),
}

export const StageTemplateCreate = z.object(stageTemplateFields).strict()
export const StageTemplateUpdate = z.object(stageTemplateFields).partial().strict()
