import { Trash } from '@medusajs/icons'
import { IconButton, Text, usePrompt } from '@medusajs/ui'
import { formatDay, formatEuro, PAYMENT_METHOD_LABEL, useSalesAction, type Booking, type PaymentMethod } from '../../lib/sales-api'
import { InlineNumber } from '../gestione/inline-number'

// Incassi registrati di un ordine, correggibili sul posto: mezzo di pagamento dalla tendina,
// importo cliccando sul numero, eliminazione con conferma. `basePath` è la rotta degli incassi
// (/admin/backoffice/orders/:id/payments o, per l'agente, /admin/sell/bookings/:id/payments).

/** Mezzo di pagamento di un incasso, cambiabile con un clic. */
export function MethodSelect({ payment, basePath, compact = false }: { payment: Booking['payments'][number]; basePath: string; compact?: boolean }) {
  const action = useSalesAction()
  return (
    <select
      aria-label={`Mezzo di pagamento dell’incasso del ${formatDay(payment.paid_at)}`}
      value={payment.method}
      onChange={(event) =>
        action.mutate({ path: `${basePath}/${payment.id}`, body: { method: event.target.value as PaymentMethod }, success: `Pagamento segnato come ${PAYMENT_METHOD_LABEL[event.target.value as PaymentMethod].toLowerCase()}.` })
      }
      className={
        compact
          ? 'txt-compact-small cursor-pointer rounded-md border border-ui-border-base bg-ui-bg-field px-1.5 py-0.5 text-ui-fg-subtle hover:text-ui-fg-base'
          : 'txt-compact-small cursor-pointer rounded-md border border-ui-border-base bg-ui-bg-field px-2 py-1'
      }
    >
      {Object.entries(PAYMENT_METHOD_LABEL).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  )
}

export function PaymentsEditor({ payments, basePath, editable }: { payments: Booking['payments']; basePath: string; editable: boolean }) {
  const action = useSalesAction()
  const prompt = usePrompt()
  const remove = async (payment: Booking['payments'][number]) => {
    const confirmed = await prompt({
      title: 'Eliminare l’incasso?',
      description: `${formatEuro(payment.amount)} del ${formatDay(payment.paid_at)}: il residuo da incassare torna a salire.`,
      confirmText: 'Elimina',
      cancelText: 'Annulla',
    })
    if (confirmed) action.mutate({ path: `${basePath}/${payment.id}`, method: 'DELETE', success: 'Incasso eliminato.' })
  }

  return (
    <div className="flex flex-col gap-2">
      <Text size="small" weight="plus">Incassi</Text>
      {payments.length === 0 ? (
        <Text size="small" className="text-ui-fg-subtle">Nessun incasso registrato.</Text>
      ) : (
        <ul className="flex flex-col gap-1">
          {payments.map((payment) => (
            <li key={payment.id} className="flex flex-wrap items-center justify-between gap-2">
              <Text size="small" className="lq-figure text-ui-fg-subtle">{formatDay(payment.paid_at)}</Text>
              {editable ? (
                <span className="flex items-center gap-1">
                  <MethodSelect payment={payment} basePath={basePath} />
                  <InlineNumber
                    value={payment.amount}
                    decimals
                    money
                    suffix="€"
                    label={`Importo dell’incasso del ${formatDay(payment.paid_at)}`}
                    onSave={(amount) => action.mutate({ path: `${basePath}/${payment.id}`, body: { amount }, success: 'Incasso corretto.' })}
                  />
                  <IconButton size="small" variant="transparent" aria-label={`Elimina l’incasso del ${formatDay(payment.paid_at)}`} onClick={() => void remove(payment)}>
                    <Trash />
                  </IconButton>
                </span>
              ) : (
                <Text size="small" className="lq-figure">
                  {PAYMENT_METHOD_LABEL[payment.method]} {formatEuro(payment.amount)}
                </Text>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
