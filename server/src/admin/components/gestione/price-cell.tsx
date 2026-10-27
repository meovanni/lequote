import { ArrowPathMini, PencilSquare } from '@medusajs/icons'
import { IconButton, Tooltip } from '@medusajs/ui'
import type { FormatRow } from '../../lib/gestione-api'
import { formatEuro, useSalesAction } from '../../lib/sales-api'
import { InlineNumber } from './inline-number'

// Prezzo di un formato nella pagina Gestione. Di norma è lo standard (prodotto contenuto più
// confezione, arrotondato ai 50 centesimi); cliccandolo lo si sceglie a mano. Un prezzo scelto a
// mano ha l'icona arancione con lo standard nel suggerimento, e il pulsante per riallinearlo.

export function PriceCell({ format, line }: { format: FormatRow; line: 'olio' | 'miele' }) {
  const action = useSalesAction()
  const standard = format.standardPrice ?? 0
  const setCustom = (price: number | null) =>
    action.mutate({
      path: '/admin/gestione/prices',
      body: { line, custom: { sku: format.sku, price } },
      success: price === null ? `Prezzo riallineato allo standard: ${formatEuro(standard)}.` : 'Prezzo personalizzato salvato.',
    })

  return (
    <div className="flex items-center justify-end gap-1">
      {format.custom && (
        <>
          <Tooltip content={`Prezzo personalizzato. Lo standard sarebbe ${formatEuro(standard)}.`}>
            <span className="inline-flex text-ui-tag-orange-icon" aria-label={`Prezzo personalizzato, standard ${formatEuro(standard)}`} tabIndex={0}>
              <PencilSquare />
            </span>
          </Tooltip>
          {format.price !== standard && (
            <Tooltip content={`Allinea al prezzo standard (${formatEuro(standard)})`}>
              <IconButton size="2xsmall" variant="transparent" aria-label={`Allinea ${format.label} al prezzo standard di ${formatEuro(standard)}`} onClick={() => setCustom(null)}>
                <ArrowPathMini className="text-ui-tag-orange-icon" />
              </IconButton>
            </Tooltip>
          )}
        </>
      )}
      <InlineNumber
        value={format.price}
        decimals
        money
        suffix="€"
        label={`Prezzo di ${format.label}`}
        // Scrivere lo stesso prezzo dello standard toglie la personalizzazione.
        onSave={(value) => setCustom(Math.abs(value - standard) < 0.005 ? null : value)}
      />
    </div>
  )
}
