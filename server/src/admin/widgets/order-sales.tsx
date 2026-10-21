import { defineWidgetConfig } from '@medusajs/admin-sdk'
import type { DetailWidgetProps, HttpTypes } from '@medusajs/framework/types'
import { Container, Heading, Text } from '@medusajs/ui'
import { PaymentForm, PaymentsSummary } from '../components/sales/payments'
import { useOrderSales, useSalesAction } from '../lib/sales-api'

/** Nella scheda ordine: chi l'ha inserito, l'agente, gli incassi registrati e il residuo. */
const OrderSalesWidget = ({ data: order }: DetailWidgetProps<HttpTypes.AdminOrder>) => {
  const sales = useOrderSales(order.id)
  const action = useSalesAction()

  if (!sales.data) return null
  const { booking, agent, payments } = sales.data
  const insertedBy = booking.insertedBy ? `${booking.insertedBy.name} (${booking.insertedBy.type === 'agente' ? 'agente' : 'back office'})` : 'Sito, dal cliente'

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Incassi</Heading>
      </div>
      <div className="grid grid-cols-2 gap-2 px-6 py-4">
        <Text size="small" weight="plus" className="text-ui-fg-subtle">
          Inserito da
        </Text>
        <Text size="small">{insertedBy}</Text>
        <Text size="small" weight="plus" className="text-ui-fg-subtle">
          Agente
        </Text>
        <Text size="small">{agent?.name ?? '—'}</Text>
        {booking.notes && (
          <>
            <Text size="small" weight="plus" className="text-ui-fg-subtle">
              Note
            </Text>
            <Text size="small">{booking.notes}</Text>
          </>
        )}
      </div>
      <div className="px-6 py-4">
        <PaymentsSummary state={payments} />
      </div>
      {order.status !== 'canceled' && (
        <div className="px-6 py-4">
          <PaymentForm
            due={payments.due}
            submitting={action.isPending}
            onSubmit={(body) => action.mutate({ path: `/admin/backoffice/orders/${order.id}/payments`, body, success: 'Incasso registrato.' })}
          />
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({ zone: 'order.details.side.after' })

export default OrderSalesWidget
