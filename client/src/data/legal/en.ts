import { BANK_TRANSFER_DAYS, SELLER } from '@/data/business'
import type { LegalContent } from './types'

// English translation of it.ts, section by section. Legal references stay as published.

const seller = `${SELLER.name}, ${SELLER.address}, VAT no. ${SELLER.vat}`
const contacts = `email ${SELLER.email}, certified email (PEC) ${SELLER.pec}, phone ${SELLER.phone}`

export const legalEn: LegalContent = {
  ui: {
    draftNotice:
      'Draft awaiting review by the farm’s legal consultant. Details in square brackets have not been provided yet.',
    translationNotice: 'Translation provided for convenience: the contract is in Italian, and the Italian text prevails.',
    updated: (date) => `Last updated: ${date}`,
    sourcesLabel: 'References',
    tocLabel: 'On this page',
    footerNavLabel: 'Legal information',
    linkLabels: {
      'condizioni-di-vendita': 'Terms of sale',
      recesso: 'Withdrawal',
      privacy: 'Privacy',
      cookie: 'Cookies',
    },
  },

  withdrawalForm: {
    openButton: 'Withdraw from contract here',
    confirmButton: 'Confirm withdrawal',
    intro: 'Fill in the details below and press “Confirm withdrawal”. We immediately email you a receipt with the content of your statement and the date and time it was sent.',
    name: 'Full name',
    email: 'Email',
    emailHelp: 'This is where you receive the withdrawal receipt.',
    order: 'Order code',
    orderHelp: 'You find it in the confirmation email, for example “Order no. H3E5C26”.',
    details: 'Products to return or notes (optional)',
    detailsHelp: 'Leave empty if you are withdrawing from the whole order.',
    required: 'Required field.',
    invalidEmail: 'Invalid email address.',
    sending: 'Sending…',
    doneTitle: 'Withdrawal sent',
    doneBody: (email, sentAt) => `We received your withdrawal statement on ${sentAt}. The receipt is on its way to ${email}: if you can’t find it, check your spam folder.`,
    error: 'Sending failed. Please try again, or email your statement to info@le-quote.it: it is still valid as long as it is sent within the 14 days.',
    tooMany: 'Too many submissions from this connection. Try again in an hour, or write to info@le-quote.it.',
  },

  documents: {
    'condizioni-di-vendita': {
      title: 'Terms of sale',
      metaDescription: 'General terms for online sales of Le Quote extra virgin olive oil and honey.',
      intro:
        'These terms apply to purchases made on this site by consumers, that is, by people buying for purposes outside any trade or profession.',
      sections: [
        {
          id: 'venditore',
          heading: 'Who sells',
          body: [`The seller is ${seller}. Contacts: ${contacts}.`],
          sources: ['D.Lgs. 206/2005 (Codice del Consumo), art. 49 c.1 lett. b-c', 'D.Lgs. 70/2003, art. 7'],
        },
        {
          id: 'prodotti-prezzi',
          heading: 'Products and prices',
          body: [
            'Each product page lists the main characteristics and the mandatory food information, available before purchase in the “Legal information” panel.',
            'Prices are in euro, VAT included. Any delivery costs are shown in the cart before you confirm the order; collection at the farm is free.',
          ],
          sources: ['Codice del Consumo, art. 49 c.1 lett. a, e', 'Reg. (UE) 1169/2011, art. 14'],
        },
        {
          id: 'ordine',
          heading: 'How the contract is concluded',
          body: [
            'Once you have chosen the products, in the cart you enter your details, the delivery option and the payment method, accept these terms and confirm with the “Order with obligation to pay” button.',
            'The contract is concluded when you receive our confirmation email, which summarises the order and contains these terms or a link to them. The contract is in Italian; the site’s translations are for convenience.',
            'If a product turns out to be unavailable after the order, we let you know and refund anything already paid without delay.',
          ],
          sources: ['Codice del Consumo, artt. 51 c.2 e 7, 61 c.5', 'D.Lgs. 70/2003, artt. 12-13'],
        },
        {
          id: 'pagamento',
          heading: 'Payment',
          body: [
            'You can pay in two ways:',
            {
              list: [
                `Bank transfer in advance: we give you the details after you order, on the confirmation page or by email. We prepare the order once the transfer has cleared; if it does not arrive within ${BANK_TRANSFER_DAYS} days of the order, the order is cancelled and we let you know.`,
                'Payment on collection, only if you choose to collect at the farm: you pay when you collect, by the means shown in the cart.',
              ],
            },
            'We do not collect or store payment card details.',
          ],
          sources: ['Codice del Consumo, art. 49 c.1 lett. g'],
        },
        {
          id: 'consegna',
          heading: 'Delivery and collection',
          body: [
            'We deliver in Italy only. The active options (collection at our farms, shipping) and their costs are the ones shown in the cart.',
            'For collection we write to you when the order is ready, with opening times and address. For shipping we deliver within 30 days of the order, unless a different time is stated at purchase.',
            'The risk of loss or damage passes to you when you receive or collect the products.',
          ],
          sources: ['Codice del Consumo, artt. 61 e 63'],
        },
        {
          id: 'recesso',
          heading: 'Right of withdrawal',
          body: [
            'You have 14 days to withdraw from the contract without giving any reason, starting from the day you receive or collect the products. Withdrawal does not apply to sealed packs you have opened after delivery, because for health protection and hygiene reasons they cannot be resold.',
            'Timing, method, return costs and refund are described on the Withdrawal page, which also contains the model form.',
          ],
          sources: ['Codice del Consumo, artt. 49 c.1 lett. h, 52, 59 c.1 lett. e'],
        },
        {
          id: 'garanzia',
          heading: 'Legal guarantee of conformity',
          body: [
            'We are liable for any lack of conformity of the products that becomes apparent within two years of delivery. For food, the best-before date on the label also applies, provided the product has been stored as indicated.',
            `If there is a defect write to us at ${SELLER.email}: depending on the case we replace the product, or reduce the price or refund you, at no cost to you.`,
          ],
          sources: ['Codice del Consumo, artt. 128 e seguenti'],
        },
        {
          id: 'reclami',
          heading: 'Complaints and dispute resolution',
          body: [
            `For complaints write to ${SELLER.email} or by certified email to ${SELLER.pec}: we reply within [10, to be confirmed] working days.`,
            'You can also turn to an alternative dispute resolution (ADR) body listed under the Italian Consumer Code. The European ODR platform closed on 20 July 2025.',
          ],
          sources: ['Codice del Consumo, artt. 141 e seguenti', 'Reg. (UE) 2024/3228'],
        },
        {
          id: 'legge-foro',
          heading: 'Governing law and jurisdiction',
          body: [
            'The contract is governed by Italian law, without prejudice to any more favourable mandatory rules of the country where you live. Disputes fall under the court of the place where you live or are domiciled.',
          ],
          sources: ['Reg. (CE) 593/2008 (Roma I), art. 6', 'Codice del Consumo, art. 66-bis'],
        },
      ],
    },

    recesso: {
      title: 'Right of withdrawal',
      metaDescription: 'How to withdraw from a purchase made on Le Quote: time limit, model form, return and refund.',
      sections: [
        {
          id: 'termine',
          heading: 'Time limit',
          body: [
            'You can withdraw within 14 days of the day on which you, or a person you have indicated other than the carrier, receive or collect the products. If the order arrives in several deliveries, the 14 days start from the last one.',
          ],
          sources: ['Codice del Consumo, art. 52 c.1 e c.2 lett. b'],
        },
        {
          id: 'esclusioni',
          heading: 'When withdrawal does not apply',
          body: [
            'Oil and honey are sold in sealed packs. A pack opened after delivery cannot be returned, for health protection and hygiene reasons. You can still withdraw for the unopened packs of the same order.',
          ],
          sources: ['Codice del Consumo, art. 59 c.1 lett. e'],
        },
        {
          id: 'come',
          heading: 'How to tell us',
          body: [
            `The simplest way is the “Withdraw from contract here” button at the top of this page: you get the receipt by email straight away. Alternatively, send us a clear statement before the deadline: by email to ${SELLER.email}, by certified email to ${SELLER.pec} or by letter to ${SELLER.address}. You may use the model form below, but you do not have to. We confirm receipt without delay.`,
            'It is enough for your message to be sent within the 14 days.',
          ],
          sources: ['Codice del Consumo, artt. 54 e 54-bis (D.Lgs. 209/2025)'],
        },
        {
          id: 'restituzione',
          heading: 'Returning the products',
          body: [
            'Return the products within 14 days of telling us you are withdrawing, by shipping them or bringing them to one of our farms. The direct cost of returning them is yours.',
            'You are only liable for any loss in value caused by handling the products beyond what is needed to establish their nature and characteristics.',
          ],
          sources: ['Codice del Consumo, artt. 57 c.1-2'],
        },
        {
          id: 'rimborso',
          heading: 'Refund',
          body: [
            'We refund everything you paid, including standard delivery costs, within 14 days of the day we receive your withdrawal. We may wait until we have received the products, or proof that you have sent them, before refunding.',
            'We refund using the same means you used to pay. If you paid cash on collection, we refund by bank transfer to the account you give us, at no cost to you.',
          ],
          sources: ['Codice del Consumo, art. 56'],
        },
        {
          id: 'modulo',
          heading: 'Model withdrawal form',
          body: [
            'Complete and return this form only if you wish to withdraw from the contract.',
            {
              list: [
                `To: ${seller}, ${SELLER.email}, PEC ${SELLER.pec}.`,
                'I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract of sale of the following goods: …',
                'Ordered on (*) / received on (*): …',
                'Order number: …',
                'Name of consumer(s): …',
                'Address of consumer(s): …',
                'Signature of consumer(s) (only if this form is sent on paper): …',
                'Date: …',
              ],
            },
            '(*) Delete as appropriate.',
          ],
          sources: ['Codice del Consumo, Allegato I, parte B'],
        },
      ],
    },

    privacy: {
      title: 'Privacy notice',
      metaDescription: 'How Le Quote handles the personal data of site visitors and customers.',
      intro: 'We only process the data needed to handle orders and to answer people who write to us. We do no marketing and no profiling.',
      sections: [
        {
          id: 'titolare',
          heading: 'Data controller',
          body: [`${seller}. For any request about your data: ${SELLER.email}.`],
          sources: ['Reg. (UE) 2016/679 (GDPR), art. 13 c.1 lett. a'],
        },
        {
          id: 'dati-finalita',
          heading: 'Which data, why, and on what basis',
          body: [
            {
              list: [
                'Orders: name, email, phone, delivery address if you choose shipping, products and amounts. Needed to conclude and perform the contract and to contact you about delivery or collection (basis: performance of the contract).',
                'Tax and accounting obligations: the order and payment data the law requires us to record and keep (basis: legal obligation).',
                'Messages: if you write to us, we use the data you give us to reply (basis: steps you requested or our legitimate interest in replying).',
                'Security: the server logs technical request data, such as the IP address, to protect the site from abuse (basis: legitimate interest in security).',
              ],
            },
            'Order data is required: without it we cannot accept the order. Looking up a batch and browsing the site require no personal data.',
          ],
          sources: ['GDPR, art. 6 c.1 lett. b, c, f', 'GDPR, art. 13 c.1 lett. c-d, c.2 lett. e'],
        },
        {
          id: 'destinatari',
          heading: 'Who receives the data',
          body: [
            'The data is processed by us and, on our behalf and under a binding contract, by:',
            {
              list: [
                'the provider of the server hosting the site and the back office: [to be named once chosen, phase 4];',
                'the provider of the mailbox we send order emails from: [to be named];',
                'our accountant, for tax compliance;',
                'the carrier, only for shipped orders: [to be named once shipping is active].',
              ],
            },
            'The bank receives the details of the transfer you make. We do not sell or pass on the data to third parties for other purposes.',
          ],
          sources: ['GDPR, artt. 13 c.1 lett. e, 28'],
        },
        {
          id: 'trasferimenti',
          heading: 'Where the data is',
          body: ['The site and back office are hosted on a server in the European Union [to be confirmed once hosting is chosen]. We do not transfer data outside the European Economic Area.'],
          sources: ['GDPR, art. 13 c.1 lett. f'],
        },
        {
          id: 'conservazione',
          heading: 'How long',
          body: [
            {
              list: [
                'Order data and accounting records: 10 years, as required by law.',
                'Carts that did not become orders: 5 days after the last change, then deleted.',
                'Messages: as long as needed to handle the request, then at most [12 months, to be confirmed].',
                'Server technical logs: [14 days, to be confirmed].',
              ],
            },
          ],
          sources: ['GDPR, art. 13 c.2 lett. a', 'Codice civile, art. 2220'],
        },
        {
          id: 'diritti',
          heading: 'Your rights',
          body: [
            `At any time you can ask us for access to your data, rectification, erasure, restriction of processing, portability, and object to processing based on legitimate interest, by writing to ${SELLER.email}. We reply within one month.`,
            'If you believe the processing breaks the law, you can lodge a complaint with the Italian data protection authority, the Garante per la protezione dei dati personali (www.garanteprivacy.it).',
            'We make no decisions based solely on automated processing.',
          ],
          sources: ['GDPR, artt. 12, 15-22, 77'],
        },
      ],
    },

    cookie: {
      title: 'Cookies and browser storage',
      metaDescription: 'What the Le Quote site stores in your browser: technical data only, no profiling.',
      intro: 'The site uses no profiling cookies or analytics tools, and loads no content from other sites. That is why we do not ask for your consent.',
      sections: [
        {
          id: 'tecnici',
          heading: 'What we store in your browser',
          body: [
            {
              list: [
                '“lequote.cart” (browser local storage): your cart code, so you find your products when you come back. It contains no personal data and is deleted once the order is placed; you can also remove it in your browser settings.',
                'Staff area: only for the people running the shop, a session cookie keeps the back office signed in and is deleted on sign-out.',
              ],
            },
            'These are technical tools, needed to provide the service you ask for: by law they do not require consent.',
          ],
          sources: [
            'D.Lgs. 196/2003 (Codice privacy), art. 122 c.1',
            'Garante privacy, Linee guida cookie e altri strumenti di tracciamento, 10 giugno 2021',
          ],
        },
        {
          id: 'terze-parti',
          heading: 'Third-party content',
          body: [
            'Fonts, images and videos are served from our own server: browsing the site sends no data to Google, social networks or other providers. If we ever add third-party tools, we will update this page and, where required, ask for your consent before enabling them.',
          ],
        },
      ],
    },
  },
}
