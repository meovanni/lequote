import type { NavItem, ShopFulfillmentOption, ShopProduct } from '@/types'

export const navItems: NavItem[] = [
  { id: 'chi-siamo', label: 'Chi siamo' },
  { id: 'territorio', label: 'Territorio' },
  { id: 'olio', label: 'Olio' },
  { id: 'miele', label: 'Miele' },
  { id: 'shop', label: 'Shop' },
  { id: 'contatti', label: 'Contatti' },
]

export const hero = {
  eyebrow: 'Azienda agricola, Abruzzo',
  title: 'Le Quote',
  subtitle: "Dal livello del mare alla quota dell'Appennino abruzzese.",
  body: "Un'azienda agricola familiare divisa tra due territori profondamente diversi: la Riserva Naturale del Borsacchio, sulla costa di Roseto degli Abruzzi, e le alture di Cerchio, nell'entroterra dell'Aquila. Da qui nascono il nostro olio extravergine e il nostro miele.",
  ctaPrimary: { label: 'Esplora il territorio', href: '#territorio' },
  ctaSecondary: { label: 'Scopri i prodotti ↓', href: '#olio' },
}

export const chiSiamo = {
  eyebrow: 'Chi siamo',
  title: 'Una famiglia, due paesaggi',
  paragraphs: [
    "Le Quote nasce da una scelta semplice: restare fedeli alla terra, qualunque sia la sua altitudine. Da una parte il vento salmastro della costa adriatica, dall'altra l'aria sottile delle quote appenniniche: due paesaggi che sembrano opposti e che, per noi, sono la stessa casa.",
    'Coltiviamo olivi e curiamo alveari seguendo il ritmo delle stagioni, con metodi che rispettano il suolo, le piante e chi le vive ogni giorno. Nessuna scorciatoia: solo il tempo necessario perché un frutto o un favo maturino come devono.',
    'Il nome Le Quote racconta proprio questo: l’azienda vive letteralmente su quote diverse, dal livello del mare fino a ottocento metri, e da questa distanza nasce la varietà dei nostri prodotti.',
  ],
  imageLabel: 'Foto: Il lavoro quotidiano tra uliveti e alveari',
}

export const territorio = {
  eyebrow: 'Territorio',
  title: 'Due quote, la stessa terra',
  intro: 'Ottocento metri di dislivello separano le nostre due sedi. Bastano per raccontare due mondi.',
  imageOliveto: '/images/oliveto.jpg',
  imageOlivetoLabel: "Foto: Il viale degli ulivi della Riserva del Borsacchio",
  imageApiario: '/images/arnie.jpg',
  imageApiarioLabel: 'Foto: Gli alveari tra le alture di Cerchio',
  markers: [
    {
      id: 'roseto',
      place: 'Roseto degli Abruzzi',
      note: 'La Riserva del Borsacchio, tra macchia mediterranea e uliveti a pochi passi dal mare.',
    },
    {
      id: 'cerchio',
      place: 'Cerchio',
      note: "Le alture dell'entroterra aquilano, dove le api raccolgono i mieli di quota.",
    },
  ],
}

export const olio = {
  eyebrow: 'Olio extravergine',
  title: 'L’olio della riserva',
  body: 'Raccogliamo le olive a mano o con leggere agevolatrici, mai prima del giusto grado di maturazione, e le portiamo al frantoio entro poche ore per preservarne aromi e proprietà. Alcune delle nostre piante sono secolari: da qui nasce un extravergine a bassa acidità, con note decise di erba appena tagliata e carciofo.',
  varieties: [
    { name: 'Moraiolo', note: 'fruttato intenso, note di carciofo e finale piccante' },
    { name: 'Leccino', note: 'dolce ed equilibrato, aromi delicati di mandorla' },
    { name: 'Pendolino', note: 'impollinatore prezioso, aggiunge complessità al blend' },
  ],
  imageLabel: 'Foto: Bottiglia di olio EVO Le Quote',
  imageLabelAlt: 'Foto: Bottiglia di olio EVO Le Quote, retro',
  image: '/images/bottiglia1.png',
  imageAlt: '/images/bottiglia2.png',
}

export const miele = {
  eyebrow: 'Miele',
  title: 'Un miele selvatico',
  body: 'I nostri alveari seguono le fioriture spontanee dei due territori: dalla macchia mediterranea del Borsacchio ai prati d’altura di Cerchio. Ne raccogliamo mieli diversi per colore, profumo e consistenza, sempre smielati a freddo per preservarne enzimi e aromi.',
  varieties: [
    { name: 'Miele di acacia', note: 'delicato, cristallizza lentamente' },
    { name: 'Millefiori', note: 'aromatico, cambia con le stagioni' },
    { name: 'Melata', note: 'ambrato e intenso, raccolto in quota' },
  ],
  imageLabel: 'Foto: Le arnie tra la macchia mediterranea',
  imageLabelAlt: 'Foto: Vasetti di miele Le Quote',
  image: '/images/arnie.jpg',
  imageAlt: '/images/miele.png',
}

export const contatti = {
  eyebrow: 'Contatti',
  title: 'Vieni a trovarci, a qualsiasi quota',
  email: 'info@lequote.it',
  phone: '[Telefono da confermare]',
  note: 'Scriveteci per visite, degustazioni o informazioni sui nostri prodotti.',
}

export const shop = {
  eyebrow: 'Shop',
  title: 'Richiedi il tuo ordine',
  intro:
    'Scegli i prodotti e le quantità: ti rispondiamo noi per confermare disponibilità, tempi e costo di spedizione o ritiro.',
  fulfillmentLabel: 'Come vuoi ricevere il tuo ordine?',
  fulfillmentOptions: [
    { id: 'spedizione', label: 'Spedizione', note: 'A casa tua, in tutta Italia.' },
    { id: 'ritiro', label: 'Ritiro in azienda', note: 'Vieni a trovarci a Roseto degli Abruzzi o a Cerchio.' },
  ] satisfies ShopFulfillmentOption[],
  addressLabel: 'Indirizzo di spedizione',
  addressPlaceholder: 'Via, città, CAP',
  formPhaseLabel: 'I tuoi dati',
  confirmationSummaryLabel: 'Hai richiesto',
  nameLabel: 'Nome e cognome',
  emailLabel: 'Email',
  phoneLabel: 'Telefono (facoltativo)',
  noteLabel: 'Note (facoltativo)',
  ctaLabel: 'Invia la richiesta',
  ctaHelp: 'Si apre il tuo programma di posta con tutti i dettagli già pronti da inviare.',
  confirmationTitle: 'Richiesta pronta',
  confirmationBody:
    "Si è aperto il tuo programma di posta con la richiesta già compilata: invia l'email e ti rispondiamo il prima possibile. Se non si è aperto nulla, scrivici direttamente a",
  selectionErrorLabel: 'Scegli almeno un prodotto prima di inviare la richiesta.',
  fulfillmentErrorLabel: "Scegli come vuoi ricevere l'ordine.",
  nameErrorLabel: 'Il nome è obbligatorio.',
  emailErrorLabel: 'Inserisci un indirizzo email valido.',
  addressErrorLabel: "L'indirizzo di spedizione è obbligatorio.",
  fallbackEmail: 'info@lequote.it',
}

// Ogni formato avrà una propria foto (image), non ancora disponibile: lasciata assente
// (ImagePlaceholder mostra il riquadro segnaposto) finché non viene fornita, con il percorso
// atteso indicato nel commento accanto a ciascuna riga, pronto da valorizzare.
export const shopCatalog = [
  {
    id: 'olio',
    name: 'Olio Extravergine',
    note: 'Il blend della riserva: Moraiolo, Leccino e Pendolino.',
    variants: [
      {
        id: 'olio-750ml',
        label: 'Bottiglia 750 ml',
        price: 15,
        imageLabel: 'Foto: Bottiglia di olio EVO Le Quote da 750 ml',
      }, // image: '/images/olio-750ml.jpg'
      {
        id: 'olio-5l',
        label: 'Latta 5 L',
        price: 75,
        imageLabel: 'Foto: Latta di olio EVO Le Quote da 5 litri',
      }, // image: '/images/olio-5l.jpg'
    ],
  },
  {
    id: 'miele',
    name: 'Miele',
    note: 'Smielato a freddo, per preservarne enzimi e aromi.',
    variants: [
      {
        id: 'miele-250g',
        label: 'Vasetto 250 g',
        price: 5,
        imageLabel: 'Foto: Vasetto di miele Le Quote da 250 g',
      }, // image: '/images/miele-250g.jpg'
      {
        id: 'miele-500g',
        label: 'Vasetto 500 g',
        price: 8,
        imageLabel: 'Foto: Vasetto di miele Le Quote da 500 g',
      }, // image: '/images/miele-500g.jpg'
    ],
  },
] satisfies ShopProduct[]

export const footer = {
  tagline: 'LE QUOTE: Olio e miele, dal mare alla montagna.',
  legal: '© 2026 Le Quote, Azienda Agricola. P.IVA [da inserire].',
  social: [
    { label: 'Instagram', href: '#' },
    { label: 'Facebook', href: '#' },
  ],
}
