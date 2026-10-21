import { StatusBadge } from '@medusajs/ui'
import { formatEuro, type Booking } from '../../lib/sales-api'

/** Stato dell'incasso di una prenotazione: annullata, da incassare (con il residuo) o saldata. */
export function BookingStatus({ booking }: { booking: Pick<Booking, 'status' | 'due'> }) {
  if (booking.status === 'canceled') return <StatusBadge color="grey">Annullata</StatusBadge>
  if (booking.due > 0) return <StatusBadge color="orange">Da incassare {formatEuro(booking.due)}</StatusBadge>
  return <StatusBadge color="green">Saldata</StatusBadge>
}
