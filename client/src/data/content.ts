import type { NavItem } from '@/types'

export const navItems: NavItem[] = [
  { id: 'chi-siamo', label: 'Chi siamo' },
  { id: 'territorio', label: 'Territorio' },
  { id: 'olio', label: 'Olio' },
  { id: 'miele', label: 'Miele' },
  { id: 'shop', label: 'Shop' },
  { id: 'contatti', label: 'Contatti' },
]

export const hero = {
  eyebrow: 'Azienda agricola — Abruzzo',
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
  title: "Lo shop online sta arrivando",
  body: "Stiamo preparando un piccolo negozio per portare l’olio e il miele delle nostre due quote direttamente a casa vostra. Nel frattempo, scriveteci: saremo felici di rispondere di persona.",
  ctaLabel: 'Scrivici per essere avvisato',
  ctaHref: 'mailto:info@lequote.it?subject=Avvisami%20quando%20lo%20shop%20apre',
}

export const footer = {
  tagline: 'LE QUOTE — Olio e miele, dal mare alla montagna.',
  legal: '© 2026 Le Quote — Azienda Agricola. P.IVA [da inserire].',
  social: [
    { label: 'Instagram', href: '#' },
    { label: 'Facebook', href: '#' },
  ],
}
