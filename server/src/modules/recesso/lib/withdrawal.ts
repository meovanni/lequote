import { toHtml, toText, type Block, type EmailLocale, type RenderedEmail } from '../../../lib/order-emails'

// Funzione di recesso online (Cod. Consumo art. 54-bis, introdotto dal D.Lgs. 209/2025): il
// cliente invia la dichiarazione dal sito e riceve senza ritardo un avviso di ricevimento su
// supporto durevole (email) con il contenuto della dichiarazione e data e ora di trasmissione.

/**
 * Limite di invii per chiave (indirizzo IP) in una finestra fissa: la rotta è pubblica e manda
 * email a un indirizzo scelto da chi scrive, quindi va protetta dagli abusi. In memoria: basta
 * per un solo server.
 */
export function createRateLimiter({ limit, windowMs, now = Date.now }: { limit: number; windowMs: number; now?: () => number }) {
  const hits = new Map<string, { start: number; count: number }>()
  return (key: string): boolean => {
    const time = now()
    const entry = hits.get(key)
    if (!entry || time - entry.start > windowMs) {
      hits.set(key, { start: time, count: 1 })
      return true
    }
    entry.count += 1
    return entry.count <= limit
  }
}

export type WithdrawalEmailData = {
  name: string
  email: string
  orderReference: string
  details: string | null
  locale: EmailLocale
  submittedAt: Date
  matchedOrderId: string | null
}

const INTL: Record<EmailLocale, string> = { it: 'it-IT', en: 'en-GB', de: 'de-DE' }

/** Data e ora di trasmissione, all'ora italiana come la sede del venditore. */
function formatTimestamp(locale: EmailLocale, date: Date): string {
  return new Intl.DateTimeFormat(INTL[locale], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Rome',
    timeZoneName: 'short',
  }).format(date)
}

const COPY = {
  it: {
    subject: 'Le Quote: abbiamo ricevuto il tuo recesso',
    greeting: (name: string) => `Ciao ${name},`,
    intro: 'confermiamo di aver ricevuto la tua dichiarazione di recesso. Questo è il suo contenuto:',
    name: 'Nome',
    email: 'Email per la conferma',
    order: 'Ordine',
    details: 'Prodotti o note',
    sentAt: 'Trasmessa il',
    next: 'Ti scriviamo a breve per la restituzione dei prodotti. Il rimborso arriva entro 14 giorni da oggi, come previsto dal Codice del Consumo.',
    signature: 'Le Quote, Azienda Agricola',
  },
  en: {
    subject: 'Le Quote: we have received your withdrawal',
    greeting: (name: string) => `Hello ${name},`,
    intro: 'we confirm that we have received your withdrawal statement. This is its content:',
    name: 'Name',
    email: 'Email for the confirmation',
    order: 'Order',
    details: 'Products or notes',
    sentAt: 'Sent on',
    next: 'We will write to you shortly about returning the products. The refund arrives within 14 days of today, as the Italian Consumer Code requires.',
    signature: 'Le Quote, Azienda Agricola',
  },
  de: {
    subject: 'Le Quote: Ihr Widerruf ist eingegangen',
    greeting: (name: string) => `Hallo ${name},`,
    intro: 'wir bestätigen den Eingang Ihrer Widerrufserklärung. Das ist ihr Inhalt:',
    name: 'Name',
    email: 'E-Mail für die Bestätigung',
    order: 'Bestellung',
    details: 'Produkte oder Hinweise',
    sentAt: 'Übermittelt am',
    next: 'Wir melden uns in Kürze wegen der Rücksendung. Die Erstattung erfolgt binnen 14 Tagen ab heute, wie es das italienische Verbrauchergesetzbuch vorsieht.',
    signature: 'Le Quote, Azienda Agricola',
  },
}

function contentRows(data: WithdrawalEmailData, locale: EmailLocale): string[] {
  const copy = COPY[locale]
  return [
    `${copy.name}: ${data.name}`,
    `${copy.email}: ${data.email}`,
    `${copy.order}: ${data.orderReference}`,
    ...(data.details ? [`${copy.details}: ${data.details}`] : []),
    `${copy.sentAt}: ${formatTimestamp(locale, data.submittedAt)}`,
  ]
}

/**
 * Ricevuta quando numero d'ordine ed email non corrispondono a un ordine: l'indirizzo è solo quello
 * scritto da chi ha compilato il modulo, quindi non si ripete niente di ciò che ha scritto (la
 * ricevuta non diventa un modo per mandare testo a terzi a nome del negozio). Data e ora restano.
 */
const UNMATCHED = {
  it: {
    greeting: 'Buongiorno,',
    body: (at: string) => `il ${at} abbiamo ricevuto una dichiarazione di recesso inviata dal nostro sito con questo indirizzo email. Non l’abbiamo ancora collegata a un ordine: ti scriviamo a breve per completarla.`,
    notYou: 'Se non l’hai inviata tu, ignora questa email.',
  },
  en: {
    greeting: 'Hello,',
    body: (at: string) => `on ${at} we received a withdrawal statement sent from our website with this email address. We have not yet matched it to an order: we will write to you shortly to complete it.`,
    notYou: 'If you did not send it, please ignore this email.',
  },
  de: {
    greeting: 'Guten Tag,',
    body: (at: string) => `am ${at} ist über unsere Website mit dieser E-Mail-Adresse eine Widerrufserklärung eingegangen. Wir konnten sie noch keiner Bestellung zuordnen und melden uns in Kürze.`,
    notYou: 'Falls Sie sie nicht gesendet haben, ignorieren Sie diese E-Mail.',
  },
}

export function renderWithdrawalReceipt(data: WithdrawalEmailData): RenderedEmail {
  const copy = COPY[data.locale]
  if (!data.matchedOrderId) {
    const unmatched = UNMATCHED[data.locale]
    const blocks: Block[] = [
      { rows: [unmatched.greeting, unmatched.body(formatTimestamp(data.locale, data.submittedAt))] },
      { rows: [unmatched.notYou, copy.signature] },
    ]
    return { subject: copy.subject, text: toText(blocks), html: toHtml(blocks) }
  }
  const blocks: Block[] = [
    { rows: [copy.greeting(data.name), copy.intro] },
    { rows: contentRows(data, data.locale) },
    { rows: [copy.next, copy.signature] },
  ]
  return { subject: copy.subject, text: toText(blocks), html: toHtml(blocks) }
}

export function renderOwnerWithdrawal(data: WithdrawalEmailData, adminOrderUrl: string | null): RenderedEmail {
  const blocks: Block[] = [
    {
      rows: [
        data.matchedOrderId
          ? `Nuovo recesso dal sito (${data.locale}). Il cliente ha già ricevuto la ricevuta automatica.`
          : `Nuovo recesso dal sito (${data.locale}). All’indirizzo indicato è partita una ricevuta breve, senza il contenuto della dichiarazione: mandagli tu la conferma completa quando hai trovato l’ordine.`,
      ],
    },
    { rows: contentRows(data, 'it') },
    {
      rows: [
        adminOrderUrl
          ? `Ordine: ${adminOrderUrl}`
          : 'Ordine non riconosciuto in automatico (numero o email non corrispondono): cercalo a mano e contatta il cliente.',
        'Da fare: concordare la restituzione e rimborsare entro 14 giorni dalla ricezione del recesso.',
      ],
    },
  ]
  return { subject: `Recesso: ordine ${data.orderReference}, ${data.name}`, text: toText(blocks), html: toHtml(blocks) }
}
