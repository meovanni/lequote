import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { contentImageStore, contentTypeFor } from '../../../../modules/contenuti/lib/image-store'

// Foto del sito caricate dal back office. Pubbliche come le altre immagini della vetrina; il nome
// è casuale e non cambia mai, quindi i browser possono tenerle a lungo.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const name = req.params.file
  const data = await contentImageStore().read(name)
  if (!data) {
    res.status(404).json({ message: 'Foto non trovata.' })
    return
  }
  res.setHeader('Content-Type', contentTypeFor(name))
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  res.send(data)
}
