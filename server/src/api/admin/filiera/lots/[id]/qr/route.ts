import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { MedusaError } from '@medusajs/framework/utils'
import {
  lotLinkCode,
  lotPageUrl,
  lotQrFileName,
  lotQrPng,
  lotQrSvg,
  labelSiteUrl,
  type QrFormat,
} from '../../../../../../modules/filiera/lib/lot-qr'
import { filiera } from '../../../helpers'

function qrFormat(value: unknown): QrFormat {
  if (value === undefined || value === 'svg') return 'svg'
  if (value === 'png') return 'png'
  throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Formato del QR non valido: svg o png.')
}

/**
 * QR del lotto per l'etichetta: ?format=svg (predefinito) o png; ?download=1 lo scarica invece di
 * mostrarlo. Anche per i lotti in bozza, così l'etichetta si prepara prima della pubblicazione:
 * la pagina risponde solo dopo.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const format = qrFormat(req.query.format)
  const lot = await filiera(req).retrieveLot(req.params.id)

  let siteUrl: string
  try {
    siteUrl = labelSiteUrl()
  } catch (error) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, (error as Error).message)
  }
  const url = lotPageUrl(siteUrl, lotLinkCode(lot))

  const disposition = req.query.download === '1' ? 'attachment' : 'inline'
  res.setHeader('Content-Disposition', `${disposition}; filename="${lotQrFileName(lot.code, format)}"`)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', 'private, no-store')

  if (format === 'png') {
    res.setHeader('Content-Type', 'image/png')
    res.send(await lotQrPng(url))
    return
  }
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
  res.send(await lotQrSvg(url))
}
