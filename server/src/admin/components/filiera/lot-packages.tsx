import { Trash } from '@medusajs/icons'
import { IconButton, Text } from '@medusajs/ui'
import { formatMeasure, LOT_UNIT, packagedTotal, type LotPackage } from '../../../modules/filiera/lib/lot-label'
import type { Lot } from '../../lib/filiera-api'
import { InlineNumber } from '../gestione/inline-number'

// Confezioni del lotto: una riga per formato (misura × pezzi), modificabile sul posto. Sotto,
// quanto è già confezionato rispetto al prodotto. Sul sito escono solo le misure, come quantità
// nominale; pezzi e totali restano qui.

type Props = { lot: Lot; onSave: (body: Record<string, unknown>) => void }

export function LotPackages({ lot, onSave }: Props) {
  const packages: LotPackage[] = lot.packages ?? []
  const unit = LOT_UNIT[lot.product_line]
  const save = (next: LotPackage[]) => onSave({ packages: next })
  const change = (index: number, patch: Partial<LotPackage>) => save(packages.map((item, i) => (i === index ? { ...item, ...patch } : item)))

  const packaged = packagedTotal(packages)
  const produced = lot.produced_quantity
  const left = produced === null ? null : Math.round((produced - packaged) * 1000) / 1000

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1" aria-label="Confezioni del lotto">
        {packages.map((item, index) => (
          <li key={index} className="flex flex-wrap items-center gap-2">
            <InlineNumber decimals value={item.size} label={`Misura del formato ${index + 1}`} suffix={unit} onSave={(size) => size > 0 && change(index, { size })} />
            <Text size="small" className="text-ui-fg-muted">×</Text>
            <InlineNumber value={item.count} label={`Pezzi del formato ${formatMeasure(item.size, lot.product_line)}`} suffix="pz" onSave={(count) => change(index, { count })} />
            <IconButton
              size="small"
              variant="transparent"
              aria-label={`Togli il formato ${formatMeasure(item.size, lot.product_line)}`}
              onClick={() => save(packages.filter((_, i) => i !== index))}
              className="hover:text-ui-fg-error"
            >
              <Trash />
            </IconButton>
          </li>
        ))}
        {/* Riga vuota per un formato nuovo: si salva appena si scrive la misura. */}
        <li className="flex flex-wrap items-center gap-2">
          <InlineNumber key={packages.length} decimals value={null} label="Misura di un nuovo formato" suffix={unit} onSave={(size) => size > 0 && save([...packages, { size, count: null }])} />
          <Text size="small" className="text-ui-fg-muted">nuovo formato: scrivi la misura, poi i pezzi</Text>
        </li>
      </ul>
      <Text size="xsmall" className="px-2 text-ui-fg-subtle">
        Confezionati {formatMeasure(packaged, lot.product_line)}
        {produced !== null && left !== null && (
          <>
            {' '}di {formatMeasure(produced, lot.product_line)} prodotti
            {left > 0 ? ` · da confezionare ${formatMeasure(left, lot.product_line)}` : left < 0 ? ` · ${formatMeasure(-left, lot.product_line)} oltre il prodotto: controlla i pezzi` : ' · tutto confezionato'}
          </>
        )}
      </Text>
    </div>
  )
}
