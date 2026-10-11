import { Label, Text } from '@medusajs/ui'
import type { ReactNode } from 'react'

type FormFieldProps = {
  id: string
  label: string
  hint?: string
  children: ReactNode
}

/** Etichetta, campo e suggerimento: la stessa riga per tutti i moduli della filiera. */
export function FormField({ id, label, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-y-2">
      <Label htmlFor={id} size="small" weight="plus">
        {label}
      </Label>
      {children}
      {hint && (
        <Text size="xsmall" className="text-ui-fg-subtle">
          {hint}
        </Text>
      )}
    </div>
  )
}

/** Testo di un input oppure null se vuoto: le API distinguono "non indicato" da stringa vuota. */
export function orNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}
