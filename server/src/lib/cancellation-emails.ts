import { formatEuro, summaryBlocks, toHtml, toText, type Block, type OrderEmailData, type RenderedEmail } from './order-emails'

// Ordine annullato perché il bonifico non è arrivato nei termini (src/jobs/cancel-unpaid-transfers.ts):
// avviso al cliente nella lingua in cui ha ordinato e ai titolari.

const COPY = {
  it: {
    subject: (id: string) => `Le Quote: ordine n. ${id} annullato`,
    greeting: (name: string) => `Ciao ${name},`,
    body: (id: string, days: number) =>
      `non abbiamo ricevuto il bonifico per l'ordine n. ${id} entro ${days} giorni, quindi l'ordine è stato annullato e i prodotti sono tornati disponibili.`,
    paidAnyway: 'Se hai già fatto il bonifico, rispondi a questa email con la ricevuta: sistemiamo tutto noi.',
    again: 'Se vuoi ancora i prodotti, puoi ordinarli di nuovo dal sito.',
    signature: 'Le Quote, Azienda Agricola',
  },
  en: {
    subject: (id: string) => `Le Quote: order no. ${id} cancelled`,
    greeting: (name: string) => `Hello ${name},`,
    body: (id: string, days: number) =>
      `we did not receive the bank transfer for order no. ${id} within ${days} days, so the order has been cancelled and the products are available again.`,
    paidAnyway: 'If you have already made the transfer, reply to this email with the receipt and we will sort it out.',
    again: 'If you still want the products, you can order them again on the site.',
    signature: 'Le Quote, Azienda Agricola',
  },
  de: {
    subject: (id: string) => `Le Quote: Bestellung Nr. ${id} storniert`,
    greeting: (name: string) => `Hallo ${name},`,
    body: (id: string, days: number) =>
      `die Überweisung für die Bestellung Nr. ${id} ist nicht innerhalb von ${days} Tagen eingegangen. Die Bestellung wurde daher storniert, die Produkte sind wieder verfügbar.`,
    paidAnyway: 'Falls Sie bereits überwiesen haben, antworten Sie bitte mit dem Beleg auf diese E-Mail: Wir kümmern uns darum.',
    again: 'Wenn Sie die Produkte weiterhin möchten, können Sie sie erneut auf der Website bestellen.',
    signature: 'Le Quote, Azienda Agricola',
  },
}

export function renderCustomerCancellation(order: OrderEmailData, days: number): RenderedEmail {
  const copy = COPY[order.locale]
  const blocks: Block[] = [
    { rows: [copy.greeting(order.customerName), copy.body(order.code, days)] },
    ...summaryBlocks(order, order.locale),
    { rows: [copy.paidAnyway, copy.again, copy.signature] },
  ]
  return { subject: copy.subject(order.code), text: toText(blocks), html: toHtml(blocks) }
}

export function renderOwnerCancellation(order: OrderEmailData, days: number, adminUrl: string): RenderedEmail {
  const customer = order.email
    ? `${order.customerName}, ${order.email}${order.phone ? `, ${order.phone}` : ''}`
    : `${order.customerName}${order.phone ? `, ${order.phone}` : ''} (nessuna email: avvisalo tu)`
  const blocks: Block[] = [
    {
      rows: [
        `L'ordine n. ${order.code} (${formatEuro('it', order.total)}) è stato annullato in automatico: il bonifico non è arrivato entro ${days} giorni.`,
        `Cliente: ${customer}`,
        'Se il bonifico arriva comunque, contatta il cliente: l’ordine annullato non si riapre, va creato di nuovo.',
      ],
    },
    ...summaryBlocks(order, 'it'),
    { rows: [`Apri l'ordine nel gestionale: ${adminUrl}`] },
  ]
  return {
    subject: `Ordine n. ${order.code} annullato: bonifico non ricevuto`,
    text: toText(blocks),
    html: toHtml(blocks),
  }
}
