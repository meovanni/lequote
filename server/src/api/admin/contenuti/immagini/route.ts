import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { MedusaError } from '@medusajs/framework/utils'
import type { z } from '@medusajs/framework/zod'
import { contentImageStore } from '../../../../modules/contenuti/lib/image-store'
import type { ContentImageUpload } from '../validators'

/** Carica una foto per il sito: compare online solo dopo averla scelta per un campo e pubblicato. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof ContentImageUpload>>, res: MedusaResponse) {
  const saved = await contentImageStore().save(Buffer.from(req.validatedBody.file_base64, 'base64'))
  if (!saved.ok) throw new MedusaError(MedusaError.Types.INVALID_DATA, saved.error)
  res.status(201).json({ url: saved.url })
}
