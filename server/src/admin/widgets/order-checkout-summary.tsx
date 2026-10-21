import { defineWidgetConfig } from '@medusajs/admin-sdk'
import type { DetailWidgetProps, HttpTypes } from '@medusajs/framework/types'
import { Container, Heading, StatusBadge, Text } from '@medusajs/ui'

// In cima alla colonna laterale della scheda ordine: come il cliente ha scelto di ricevere e di pagare, e cosa fare
// adesso. Il back office di Medusa mostra il fornitore di pagamento solo come codice
// (pp_bonifico_lequote): qui diventa una frase. I codici sono quelli di src/modules/manual-payments.
const PAYMENT: Record<string, { label: string; todo: string }> = {
  pp_bonifico_lequote: {
    label: 'Bonifico bancario',
    todo: 'Quando il bonifico risulta accreditato, premi «Cattura pagamento» nella sezione Pagamenti, poi prepara l’ordine.',
  },
  pp_ritiro_lequote: {
    label: 'Pagamento al ritiro',
    todo: 'Prepara l’ordine e avvisa il cliente. Quando ritira e paga, premi «Cattura pagamento» nella sezione Pagamenti.',
  },
  pp_gestionale_lequote: {
    label: 'Incassi registrati nel gestionale',
    todo: 'Registra ogni incasso (acconti compresi) nel riquadro «Incassi»: al saldo il pagamento risulta incassato da solo.',
  },
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 items-start px-6 py-4">
      <Text size="small" weight="plus" className="text-ui-fg-subtle">
        {label}
      </Text>
      <div>{children}</div>
    </div>
  )
}

const OrderCheckoutSummary = ({ data: order }: DetailWidgetProps<HttpTypes.AdminOrder>) => {
  const providerId = order.payment_collections?.[0]?.payments?.[0]?.provider_id ?? ''
  const payment = PAYMENT[providerId]
  const captured = order.payment_status === 'captured'
  const delivery = order.shipping_methods?.[0]?.name ?? '-'
  const phone = order.shipping_address?.phone

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Consegna e pagamento</Heading>
        <StatusBadge color={captured ? 'green' : 'orange'}>{captured ? 'Pagato' : 'Da incassare'}</StatusBadge>
      </div>
      <Row label="Consegna">
        <Text size="small">{delivery}</Text>
      </Row>
      <Row label="Pagamento">
        <Text size="small">{payment?.label ?? (providerId || '-')}</Text>
      </Row>
      {phone && (
        <Row label="Telefono">
          <Text size="small">
            <a href={`tel:${phone}`} className="text-ui-fg-interactive">
              {phone}
            </a>
          </Text>
        </Row>
      )}
      {payment && !captured && (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {payment.todo}
          </Text>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({ zone: 'order.details.side.before' })

export default OrderCheckoutSummary
