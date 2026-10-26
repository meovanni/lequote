import { Badge, Button, Container, Heading, Text, clx } from '@medusajs/ui'
import { useState } from 'react'
import { formatVolume, LINE_LABEL, type FormatRow, type LineRow } from '../../lib/gestione-api'
import { formatEuro, useSalesAction } from '../../lib/sales-api'
import { InlineNumber } from './inline-number'

// Magazzino in litri e chili: per ogni linea lo sfuso e i pezzi pronti, quello che serve agli ordini
// aperti e quello che resta da vendere. Quantità e prezzi si cambiano sul posto.

function PackButton({ format, toPack, unit }: { format: FormatRow; toPack: number; unit: 'L' | 'kg' }) {
  const action = useSalesAction()
  const [pieces, setPieces] = useState(toPack > 0 ? String(toPack) : '')
  const count = Number(pieces)
  const valid = Number.isInteger(count) && count > 0
  return (
    <form
      className="flex items-center justify-end gap-1"
      onSubmit={(event) => {
        event.preventDefault()
        if (!valid) return
        action.mutate(
          { path: '/admin/gestione/pack', body: { sku: format.sku, pieces: count }, success: `Confezionati ${count} pezzi: ${formatVolume(count * format.size, unit)} di sfuso usati.` },
          { onSuccess: () => setPieces('') },
        )
      }}
    >
      <input
        aria-label={`Pezzi da confezionare: ${format.label}`}
        inputMode="numeric"
        value={pieces}
        placeholder="0"
        onChange={(event) => setPieces(event.target.value)}
        className="lq-figure w-14 rounded-md border border-ui-border-base bg-ui-bg-field px-2 py-1 text-right outline-none focus:border-ui-border-interactive"
      />
      <Button size="small" variant="secondary" type="submit" disabled={!valid} isLoading={action.isPending}>
        Confeziona
      </Button>
    </form>
  )
}

function LineCard({ line, formats }: { line: LineRow; formats: FormatRow[] }) {
  const action = useSalesAction()
  const bulkFormat = formats.find((format) => format.line === line.line && format.bulk)!
  const saveCount = (sku: string, quantity: number, what: string) =>
    action.mutate({ path: '/admin/gestione/stock', body: { sku, quantity }, success: `${what} aggiornato.` })
  const savePrice = (sku: string, price: number) => action.mutate({ path: '/admin/gestione/prices', body: { sku, price }, success: 'Prezzo aggiornato.' })
  const bulkWord = line.line === 'olio' ? 'da imbottigliare' : 'da invasettare'

  return (
    <Container className="flex flex-col gap-4 p-0">
      <div className="flex flex-wrap items-end justify-between gap-3 px-6 pt-5">
        <div>
          <Heading level="h2">{LINE_LABEL[line.line]}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {formatVolume(line.total, line.unit)} in magazzino · <span className="text-ui-fg-base">{formatVolume(Math.max(0, line.free), line.unit)} liberi</span>
          </Text>
        </div>
        {line.freeBulk < 0 && <Badge color="red">Mancano {formatVolume(-line.freeBulk, line.unit)} di sfuso per gli ordini aperti</Badge>}
      </div>

      <table className="w-full">
        <thead>
          <tr className="txt-compact-xsmall-plus text-ui-fg-muted">
            <th className="px-6 pb-2 text-left font-normal">Formato</th>
            <th className="pb-2 text-right font-normal">In magazzino</th>
            <th className="pb-2 pl-4 text-left font-normal">Ordini aperti</th>
            <th className="pb-2 text-right font-normal">Ancora vendibili</th>
            <th className="pb-2 text-right font-normal">Prezzo</th>
            <th className="px-6 pb-2 text-right font-normal">Dallo sfuso</th>
          </tr>
        </thead>
        <tbody className="txt-compact-small">
          <tr className="border-t border-ui-border-base bg-ui-bg-subtle">
            <td className="px-6 py-2 font-medium">Sfuso</td>
            <td className="py-2 text-right">
              <InlineNumber value={line.bulk / 1000} decimals suffix={line.unit} label={`Sfuso in magazzino (${line.unit})`} onSave={(value) => saveCount(bulkFormat.sku, value, 'Sfuso')} />
            </td>
            <td className="py-2 pl-4 text-ui-fg-subtle">{line.bulkOrdered > 0 ? `${formatVolume(line.bulkOrdered, line.unit)} ${bulkWord}` : '-'}</td>
            <td className={clx('lq-figure py-2 text-right', line.freeBulk < 0 && 'text-ui-fg-error')}>{formatVolume(line.freeBulk, line.unit)}</td>
            <td className="py-2 text-right">
              <InlineNumber value={bulkFormat.price} decimals suffix={`€/${line.unit}`} label={`Prezzo al ${line.unit === 'L' ? 'litro' : 'chilo'} dello sfuso`} onSave={(value) => savePrice(bulkFormat.sku, value)} />
            </td>
            <td className="px-6 py-2" />
          </tr>
          {line.formats.map((row) => {
            const format = formats.find((entry) => entry.sku === row.sku)!
            return (
              <tr key={row.sku} className="border-t border-ui-border-base">
                <td className="px-6 py-2">{format.label}</td>
                <td className="py-2 text-right">
                  <InlineNumber value={row.ready} suffix="pz" label={`${format.label} pronti`} onSave={(value) => saveCount(row.sku, value, format.label)} />
                </td>
                <td className="py-2 pl-4 text-ui-fg-subtle">
                  {row.ordered > 0 ? `${row.ordered} ordinati` : '-'}
                  {row.toPack > 0 && <span className="text-ui-tag-orange-text"> · {row.toPack} da confezionare</span>}
                </td>
                <td className={clx('lq-figure py-2 text-right', row.available === 0 && 'text-ui-fg-error')}>{row.available === 0 ? 'esaurito' : `${row.available} pz`}</td>
                <td className="py-2 text-right">
                  <InlineNumber value={format.price} decimals suffix="€" label={`Prezzo di ${format.label}`} onSave={(value) => savePrice(row.sku, value)} />
                </td>
                <td className="px-6 py-2">
                  <PackButton key={row.toPack} format={format} toPack={row.toPack} unit={line.unit} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <Text size="xsmall" className="px-6 pb-4 text-ui-fg-muted">
        Clicca su un numero per correggerlo. Gli ordini prendono prima i pezzi pronti; quelli che mancano si confezionano dallo sfuso.
        {bulkFormat.price !== null && ` Sfuso venduto a ${formatEuro(bulkFormat.price)} al ${line.unit === 'L' ? 'litro' : 'chilo'}.`}
      </Text>
    </Container>
  )
}

export function StockPanel({ lines, formats }: { lines: LineRow[]; formats: FormatRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 2xl:grid-cols-2">
      {lines.map((line) => (
        <LineCard key={line.line} line={line} formats={formats} />
      ))}
    </div>
  )
}
