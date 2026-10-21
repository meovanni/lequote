import { Button, clx, Input } from '@medusajs/ui'
import { useState } from 'react'
import type { Period } from '../../lib/sales-api'

type PresetId = 'tutto' | 'mese' | 'mese-scorso' | 'anno'

const PRESETS: { id: PresetId; label: string }[] = [
  { id: 'tutto', label: 'Tutto' },
  { id: 'mese', label: 'Questo mese' },
  { id: 'mese-scorso', label: 'Mese scorso' },
  { id: 'anno', label: 'Quest’anno' },
]

/** Data locale come AAAA-MM-GG, il formato del filtro e delle API. */
function ymd(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function presetPeriod(id: PresetId, today = new Date()): Period {
  const year = today.getFullYear()
  const month = today.getMonth()
  switch (id) {
    case 'mese':
      return { from: ymd(new Date(year, month, 1)) }
    case 'mese-scorso':
      return { from: ymd(new Date(year, month - 1, 1)), to: ymd(new Date(year, month, 0)) }
    case 'anno':
      return { from: ymd(new Date(year, 0, 1)) }
    default:
      return {}
  }
}

function activePreset(period: Period): PresetId | null {
  const match = PRESETS.find(({ id }) => {
    const preset = presetPeriod(id)
    return (preset.from ?? '') === (period.from ?? '') && (preset.to ?? '') === (period.to ?? '')
  })
  return match?.id ?? null
}

type PeriodFilterProps = {
  period: Period
  onChange: (period: Period) => void
  /** Allineamento delle date libere: a destra nelle barre degli strumenti, a sinistra da sole. */
  align?: 'start' | 'end'
}

/**
 * Periodo di riepiloghi e classifiche: scorciatoie per i casi di tutti i giorni, date libere per il
 * resto. Estremi compresi; nessuna data = da sempre.
 */
export function PeriodFilter({ period, onChange, align = 'end' }: PeriodFilterProps) {
  const active = activePreset(period)
  const [custom, setCustom] = useState(active === null)
  const showDates = custom || active === null

  return (
    <div className={clx('flex flex-col items-start gap-2', align === 'end' && 'md:items-end')}>
      <div role="group" aria-label="Periodo" className="flex flex-wrap gap-1 rounded-lg bg-ui-bg-component p-1">
        {PRESETS.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            size="small"
            variant={!showDates && active === preset.id ? 'secondary' : 'transparent'}
            aria-pressed={!showDates && active === preset.id}
            onClick={() => {
              setCustom(false)
              onChange(presetPeriod(preset.id))
            }}
          >
            {preset.label}
          </Button>
        ))}
        <Button type="button" size="small" variant={showDates ? 'secondary' : 'transparent'} aria-pressed={showDates} onClick={() => setCustom(true)}>
          Date
        </Button>
      </div>
      {showDates && (
        <div className="flex items-center gap-2">
          <Input
            aria-label="Dal"
            type="date"
            size="small"
            value={period.from ?? ''}
            onChange={(event) => onChange({ ...period, from: event.target.value || undefined })}
          />
          <span className="text-ui-fg-muted" aria-hidden>
            -
          </span>
          <Input
            aria-label="Al"
            type="date"
            size="small"
            value={period.to ?? ''}
            onChange={(event) => onChange({ ...period, to: event.target.value || undefined })}
          />
        </div>
      )}
    </div>
  )
}
