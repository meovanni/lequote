// Testi delle email d'ordine: conferma al cliente (nella lingua del sito da cui ha ordinato) e
// avviso ai titolari (in italiano). Funzioni pure: ricevono l'ordine già letto e restituiscono
// oggetto, testo semplice e HTML. I dati tra parentesi quadre non sono ancora stati forniti
// (docs/plan.md); gli stessi valori stanno in client/src/data/business.ts per la pagina di conferma.
// Quelli cambiati dal back office (Contenuti › Dati aziendali) arrivano con bankTransferDetails.

export type BankTransfer = { holder: string; iban: string }

// Vuote finché i titolari non le inseriscono: l'email dice che gli estremi arrivano dopo la conferma.
export const BANK_TRANSFER: BankTransfer = {
  holder: '',
  iban: '',
}

/** Coordinate del bonifico: quelle pubblicate dal back office, altrimenti quelle di partenza. */
export function bankTransferDetails(shared: Record<string, string>): BankTransfer {
  return {
    holder: shared['business.BANK_TRANSFER.holder'] ?? BANK_TRANSFER.holder,
    iban: shared['business.BANK_TRANSFER.iban'] ?? BANK_TRANSFER.iban,
  }
}

export type EmailLocale = 'it' | 'en' | 'de'
export type PaymentMethod = 'bonifico' | 'ritiro'

export interface OrderEmailLine {
  sku: string
  title: string
  subtitle: string
  quantity: number
  total: number
}

export interface OrderEmailData {
  /** Codice d'ordine per il cliente (lib/order-code.ts), es. H3E5C26. */
  code: string
  email: string
  customerName: string
  phone: string
  locale: EmailLocale
  lines: OrderEmailLine[]
  itemTotal: number
  shippingTotal: number
  taxTotal: number
  total: number
  deliveryName: string
  /** Indirizzo su una riga, vuoto per i ritiri. */
  address: string
  paymentMethod: PaymentMethod | null
  /** Chi ha inserito l'ordine dal gestionale (agente o amministratore); assente per gli ordini dal sito. */
  insertedBy?: string | null
  /** Funzione di recesso del sito per questo ordine (art. 54-bis Cod. Consumo), se nota. */
  withdrawalUrl?: string
}

export interface RenderedEmail {
  subject: string
  text: string
  html: string
}

export const PAYMENT_METHODS: Record<string, PaymentMethod> = {
  pp_bonifico_lequote: 'bonifico',
  pp_ritiro_lequote: 'ritiro',
}

export function toEmailLocale(locale: string | null | undefined): EmailLocale {
  const language = (locale ?? '').slice(0, 2).toLowerCase()
  return language === 'en' || language === 'de' ? language : 'it'
}

// Nomi dei formati nelle altre lingue; in italiano valgono i titoli del catalogo.
const PRODUCT_NAMES: Record<Exclude<EmailLocale, 'it'>, Record<string, string>> = {
  en: {
    'OLIO-750ML': 'Extra virgin olive oil, 750 ml bottle',
    'OLIO-5L': 'Extra virgin olive oil, 5 L tin',
    'MIELE-250G': 'Honey, 250 g jar',
    'MIELE-500G': 'Honey, 500 g jar',
  },
  de: {
    'OLIO-750ML': 'Natives Olivenöl extra, Flasche 750 ml',
    'OLIO-5L': 'Natives Olivenöl extra, Kanister 5 L',
    'MIELE-250G': 'Honig, Glas 250 g',
    'MIELE-500G': 'Honig, Glas 500 g',
  },
}

const COPY = {
  it: {
    subject: (id: string) => `Le Quote: abbiamo ricevuto l'ordine n. ${id}`,
    greeting: (name: string) => `Ciao ${name},`,
    intro: (id: string) => `grazie per il tuo ordine n. ${id}. Ecco il riepilogo.`,
    products: 'Prodotti',
    delivery: 'Consegna',
    pickup: (place: string) => `Ritiro a ${place}`,
    address: 'Indirizzo',
    subtotal: 'Prodotti',
    shipping: 'Consegna',
    free: 'gratuita',
    total: 'Totale',
    tax: (amount: string) => `IVA inclusa: ${amount}`,
    bankTitle: 'Come pagare con bonifico',
    holder: 'Intestatario',
    bankPending: "Gli estremi per il pagamento ti saranno forniti a seguito della conferma dell'ordine.",
    reason: 'Causale',
    reasonValue: (id: string) => `Ordine ${id} Le Quote`,
    amount: 'Importo',
    bankNote: "Prepariamo l'ordine quando il bonifico risulta accreditato.",
    pickupPayment: "Paghi in azienda quando ritiri l'ordine: [contanti e/o carta, da confermare].",
    pickupNote: 'Ti scriviamo quando è pronto per il ritiro. Orari: [da confermare].',
    withdrawal: (url: string) => `Puoi recedere entro 14 giorni dal ricevimento: recedere dal contratto qui, ${url}`,
    closing: 'Per qualsiasi domanda rispondi pure a questa email.',
    signature: 'Le Quote, Azienda Agricola',
  },
  en: {
    subject: (id: string) => `Le Quote: we have received order no. ${id}`,
    greeting: (name: string) => `Hello ${name},`,
    intro: (id: string) => `thank you for your order no. ${id}. Here is the summary.`,
    products: 'Products',
    delivery: 'Delivery',
    pickup: (place: string) => `Pickup in ${place}`,
    address: 'Address',
    subtotal: 'Products',
    shipping: 'Delivery',
    free: 'free',
    total: 'Total',
    tax: (amount: string) => `VAT included: ${amount}`,
    bankTitle: 'How to pay by bank transfer',
    holder: 'Account holder',
    bankPending: 'We will send you the payment details once your order is confirmed.',
    reason: 'Reference',
    reasonValue: (id: string) => `Ordine ${id} Le Quote`,
    amount: 'Amount',
    bankNote: 'We prepare the order once the transfer has cleared.',
    pickupPayment: 'Pay at the farm when you collect the order: [cash and/or card, to be confirmed].',
    pickupNote: 'We will write to you when it is ready for pickup. Hours: [to be confirmed].',
    withdrawal: (url: string) => `You may withdraw within 14 days of receipt: withdraw from contract here, ${url}`,
    closing: 'If you have any questions, just reply to this email.',
    signature: 'Le Quote, Azienda Agricola',
  },
  de: {
    subject: (id: string) => `Le Quote: Ihre Bestellung Nr. ${id} ist eingegangen`,
    greeting: (name: string) => `Guten Tag ${name},`,
    intro: (id: string) => `vielen Dank für Ihre Bestellung Nr. ${id}. Hier die Übersicht.`,
    products: 'Produkte',
    delivery: 'Lieferung',
    pickup: (place: string) => `Abholung in ${place}`,
    address: 'Adresse',
    subtotal: 'Produkte',
    shipping: 'Lieferung',
    free: 'kostenlos',
    total: 'Gesamt',
    tax: (amount: string) => `inkl. MwSt.: ${amount}`,
    bankTitle: 'Bezahlung per Überweisung',
    holder: 'Kontoinhaber',
    bankPending: 'Die Zahlungsdaten erhalten Sie nach der Bestätigung Ihrer Bestellung.',
    reason: 'Verwendungszweck',
    reasonValue: (id: string) => `Ordine ${id} Le Quote`,
    amount: 'Betrag',
    bankNote: 'Wir bereiten die Bestellung vor, sobald die Überweisung eingegangen ist.',
    pickupPayment: 'Sie bezahlen auf dem Hof bei der Abholung: [bar und/oder Karte, noch zu bestätigen].',
    pickupNote: 'Wir schreiben Ihnen, sobald die Bestellung zur Abholung bereit ist. Öffnungszeiten: [noch zu bestätigen].',
    withdrawal: (url: string) => `Sie können binnen 14 Tagen ab Erhalt widerrufen: Vertrag hier widerrufen, ${url}`,
    closing: 'Bei Fragen antworten Sie einfach auf diese E-Mail.',
    signature: 'Le Quote, Azienda Agricola',
  },
} satisfies Record<EmailLocale, unknown>

const INTL: Record<EmailLocale, string> = { it: 'it-IT', en: 'en-IE', de: 'de-DE' }

export function formatEuro(locale: EmailLocale, amount: number): string {
  return new Intl.NumberFormat(INTL[locale], { style: 'currency', currency: 'EUR' }).format(amount)
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Le opzioni di ritiro nel back office si chiamano "Ritiro a <comune>" (seed): nelle altre lingue
// si riscrive la frase, il comune resta.
const PICKUP_PREFIX = 'Ritiro a '

export function deliveryLabel(locale: EmailLocale, name: string): string {
  return name.startsWith(PICKUP_PREFIX) ? COPY[locale].pickup(name.slice(PICKUP_PREFIX.length)) : name
}

function lineName(locale: EmailLocale, line: OrderEmailLine): string {
  if (locale !== 'it') {
    const translated = PRODUCT_NAMES[locale][line.sku]
    if (translated) return translated
  }
  return [line.title, line.subtitle].filter(Boolean).join(', ')
}

// Blocchi del messaggio come coppie titolo / righe: lo stesso contenuto produce testo e HTML.
export type Block = { title?: string; rows: string[] }

export function toText(blocks: Block[]): string {
  return blocks.map((block) => [block.title?.toUpperCase(), ...block.rows].filter(Boolean).join('\n')).join('\n\n')
}

export function toHtml(blocks: Block[]): string {
  const body = blocks
    .map((block) => {
      const title = block.title ? `<h2 style="font-size:15px;margin:0 0 8px">${escapeHtml(block.title)}</h2>` : ''
      const rows = block.rows.map((row) => `<p style="margin:0 0 4px">${escapeHtml(row)}</p>`).join('')
      return `<div style="margin:0 0 20px">${title}${rows}</div>`
    })
    .join('')
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#233142">${body}</body></html>`
}

export function summaryBlocks(order: OrderEmailData, locale: EmailLocale): Block[] {
  const copy = COPY[locale]
  const euro = (amount: number) => formatEuro(locale, amount)
  return [
    {
      title: copy.products,
      rows: order.lines.map((line) => `${line.quantity} × ${lineName(locale, line)}: ${euro(line.total)}`),
    },
    {
      title: copy.delivery,
      rows: [deliveryLabel(locale, order.deliveryName), ...(order.address ? [`${copy.address}: ${order.address}`] : [])],
    },
    {
      rows: [
        `${copy.subtotal}: ${euro(order.itemTotal)}`,
        `${copy.shipping}: ${order.shippingTotal === 0 ? copy.free : euro(order.shippingTotal)}`,
        `${copy.total}: ${euro(order.total)}`,
        copy.tax(euro(order.taxTotal)),
      ],
    },
  ]
}

export function renderCustomerConfirmation(order: OrderEmailData, bank: BankTransfer = BANK_TRANSFER): RenderedEmail {
  const locale = order.locale
  const copy = COPY[locale]
  const payment: Block[] =
    order.paymentMethod === 'bonifico'
      ? [
          {
            title: copy.bankTitle,
            rows: [
              ...(bank.iban ? [...(bank.holder ? [`${copy.holder}: ${bank.holder}`] : []), `IBAN: ${bank.iban}`] : [copy.bankPending]),
              `${copy.reason}: ${copy.reasonValue(order.code)}`,
              `${copy.amount}: ${formatEuro(locale, order.total)}`,
              copy.bankNote,
            ],
          },
        ]
      : order.paymentMethod === 'ritiro'
        ? [{ rows: [copy.pickupPayment] }]
        : []
  const pickup = order.address ? [] : [{ rows: [copy.pickupNote] }]

  const blocks: Block[] = [
    { rows: [copy.greeting(order.customerName), copy.intro(order.code)] },
    ...summaryBlocks(order, locale),
    ...payment,
    ...pickup,
    ...(order.withdrawalUrl ? [{ rows: [copy.withdrawal(order.withdrawalUrl)] }] : []),
    { rows: [copy.closing, copy.signature] },
  ]
  return { subject: copy.subject(order.code), text: toText(blocks), html: toHtml(blocks) }
}

const PAYMENT_LABEL: Record<PaymentMethod, string> = { bonifico: 'Bonifico bancario', ritiro: 'Pagamento al ritiro' }

export function renderOwnerAlert(order: OrderEmailData, adminUrl: string): RenderedEmail {
  const blocks: Block[] = [
    {
      rows: [
        `Nuovo ordine n. ${order.code} ${order.insertedBy ? `inserito da ${order.insertedBy}` : 'dal sito'}: ${formatEuro('it', order.total)}.`,
        `Cliente: ${order.customerName}, ${order.email}${order.phone ? `, ${order.phone}` : ''}`,
        `Pagamento: ${order.paymentMethod ? PAYMENT_LABEL[order.paymentMethod] : order.insertedBy ? 'incassi registrati nel gestionale' : 'non indicato'}`,
        `Lingua del cliente: ${order.locale}`,
      ],
    },
    ...summaryBlocks(order, 'it'),
    { rows: [`Apri l'ordine nel gestionale: ${adminUrl}`] },
  ]
  return {
    subject: `Nuovo ordine n. ${order.code}: ${formatEuro('it', order.total)}, ${order.customerName}`,
    text: toText(blocks),
    html: toHtml(blocks),
  }
}
