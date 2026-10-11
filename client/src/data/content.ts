import type {
  FaqTopic,
  FilieraLine,
  NavItem,
  SeasonTrack,
  ShopFulfillmentOption,
  ShopProduct,
} from '@/types'

export const navItems: NavItem[] = [
  { id: 'territorio', label: 'Territorio' },
  { id: 'olio', label: 'Olio' },
  { id: 'miele', label: 'Miele' },
  { id: 'filiera', label: 'Filiera' },
  { id: 'stagioni', label: 'Stagioni' },
  { id: 'shop', label: 'Shop' },
]

// Il footer porta anche le sezioni che non stanno nella barra principale.
export const footerNavItems: NavItem[] = [
  { id: 'chi-siamo', label: 'Chi siamo' },
  ...navItems,
  { id: 'domande', label: 'Domande frequenti' },
  { id: 'contatti', label: 'Contatti' },
]

export const hero = {
  eyebrow: 'Azienda agricola, Abruzzo',
  title: 'Le Quote',
  subtitle: "Dal livello del mare alla quota dell'Appennino abruzzese.",
  body: "Un'azienda agricola familiare divisa tra due territori profondamente diversi: la Riserva Naturale del Borsacchio, sulla costa di Roseto degli Abruzzi, e le alture di Cerchio, nell'entroterra dell'Aquila. Da qui nascono il nostro olio extravergine e il nostro miele.",
  poster: '/images/oliveto.jpg',
  posterAlt: 'Il viale degli ulivi della Riserva del Borsacchio',
  ctaPrimary: { label: 'Esplora il territorio', href: '#territorio' },
  ctaSecondary: { label: 'Scopri i prodotti ↓', href: '#olio' },
}

export const chiSiamo = {
  eyebrow: 'Chi siamo',
  title: 'Una famiglia, due paesaggi',
  paragraphs: [
    "Le Quote nasce da una scelta semplice: restare fedeli alla terra, qualunque sia la sua altitudine. Da una parte il vento salmastro della costa adriatica, dall'altra l'aria sottile delle quote appenniniche: due paesaggi che sembrano opposti e che, per noi, sono la stessa casa.",
    'Sulla costa coltiviamo olivi, in montagna curiamo i nostri alveari, seguendo il ritmo delle stagioni. Nessuna scorciatoia: solo il tempo necessario perché un frutto o un favo maturino come devono.',
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
  elevation: 'La quota del mare',
  // Nessuna dichiarazione di acidità né descrittori organolettici: per legge richiedono le
  // analisi complete e il panel test dell'annata (Reg. del. UE 2022/2104, art. 10). Torneranno
  // per lotto, accanto ai referti, quando il back office li pubblicherà.
  body: 'Usiamo solo le olive dei nostri oliveti, alcuni con piante secolari. Le raccogliamo a mano o con leggere agevolatrici, al giusto grado di maturazione, e le portiamo al frantoio entro poche ore. Ogni campagna l’olio viene analizzato in laboratorio.',
  varieties: [
    { name: 'Moraiolo', note: 'cultivar tradizionale dell’Italia centrale' },
    { name: 'Leccino', note: 'pianta rustica, resiste bene al freddo' },
    { name: 'Pendolino', note: 'impollinatore degli altri olivi del campo' },
  ],
  imageLabel: 'Foto: Bottiglia di olio EVO Le Quote',
  imageLabelAlt: 'Foto: Bottiglia di olio EVO Le Quote, retro',
  image: '/images/bottiglia1.png',
  imageAlt: '/images/bottiglia2.png',
}

export const miele = {
  eyebrow: 'Miele',
  title: 'Il miele di quota',
  elevation: 'La quota della montagna',
  body: 'I nostri alveari stanno tutti sulle alture di Cerchio, nell’entroterra aquilano, e seguono le fioriture spontanee dei prati e dei boschi d’altura. Ne raccogliamo mieli diversi per colore, profumo e consistenza, sempre smielati a freddo.',
  // La denominazione floreale (es. "acacia") va dimostrata dall'analisi dell'annata: se un anno
  // l'analisi non la conferma, quel miele si vende come millefiori.
  varieties: [
    { name: 'Miele di acacia', note: 'chiaro e delicato, resta liquido a lungo' },
    { name: 'Millefiori', note: 'cambia con le fioriture di ogni stagione' },
    { name: 'Melata', note: 'scuro, raccolto a fine estate' },
  ],
  imageLabel: 'Foto: Le arnie sulle alture di Cerchio',
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
export const shopCatalog: ShopProduct[] = [
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
]

// Bozza da validare con il consulente (docs/plan.md): i riferimenti normativi vengono dal
// report del 2026-10-11. I valori tra parentesi quadre sono dati non ancora forniti dai titolari.
export const filiera = {
  eyebrow: 'Filiera',
  title: 'Dalla pianta al tuo lotto',
  intro:
    'Ogni bottiglia e ogni vasetto portano un codice lotto. Qui trovi il percorso che compie ciascun prodotto, dal campo all’etichetta.',
  legalPanelLabel: 'Informazioni di legge',
  internalNote:
    'Per ogni lotto conserviamo anche i registri richiesti dalle autorità di controllo (Reg. CE 178/2002, art. 18): restano interni e non vengono pubblicati.',
  lines: [
    {
      line: 'olio',
      label: 'Olio extravergine',
      elevation: 'Livello del mare',
      summary: 'Solo olive dei nostri oliveti, molite da un frantoio scelto per ogni campagna.',
      steps: [
        {
          id: 'oliveto',
          title: 'Oliveto',
          place: 'Riserva del Borsacchio, Roseto degli Abruzzi',
          period: 'Tutto l’anno',
          description: 'Lavoriamo solo i nostri olivi: non acquistiamo olive da altri produttori.',
        },
        {
          id: 'raccolta',
          title: 'Raccolta',
          place: 'Borsacchio',
          period: 'Ottobre, novembre',
          description: 'A mano o con leggere agevolatrici, al giusto grado di maturazione.',
        },
        {
          id: 'molitura',
          title: 'Molitura',
          place: 'Frantoio della campagna',
          period: 'Entro poche ore',
          description: 'Il frantoio cambia di anno in anno: per ogni lotto indichiamo quale.',
        },
        {
          id: 'analisi',
          title: 'Analisi',
          place: 'Laboratorio',
          period: 'Ogni campagna',
          description: 'Analisi chimiche e organolettiche sull’olio dell’annata.',
        },
        {
          id: 'imbottigliamento',
          title: 'Imbottigliamento',
          place: 'Presso il frantoio',
          period: 'Dopo la molitura',
          description: 'Ogni bottiglia riceve il codice lotto e il termine minimo di conservazione.',
        },
      ],
      legalInfo: [
        {
          label: 'Denominazione',
          value: 'Olio extra vergine di oliva',
          reference: 'Reg. del. (UE) 2022/2104, art. 5',
        },
        {
          label: 'Categoria',
          value:
            'Olio d’oliva di categoria superiore ottenuto direttamente dalle olive e unicamente mediante procedimenti meccanici',
          reference: 'Reg. del. (UE) 2022/2104, art. 5',
        },
        {
          label: 'Origine',
          value: 'Italia: olive raccolte e molite in Italia',
          reference: 'Reg. del. (UE) 2022/2104, art. 8; L. 9/2013, art. 1',
        },
        {
          label: 'Campagna di raccolta',
          value: 'Indicata in etichetta, prima del termine minimo di conservazione',
          reference: 'L. 9/2013, art. 7',
        },
        {
          label: 'Conservazione',
          value: 'Al riparo dalla luce e dal calore',
          reference: 'Reg. del. (UE) 2022/2104, art. 7',
        },
        {
          label: 'Dichiarazione nutrizionale',
          value: 'In etichetta e nella scheda prodotto, per 100 ml',
          reference: 'Reg. (UE) 1169/2011, art. 30',
        },
        {
          label: 'Lotto',
          value: 'Codice preceduto dalla lettera L',
          reference: 'D.Lgs. 231/2017, art. 17',
        },
        {
          label: 'Operatore',
          value: 'Le Quote, Azienda Agricola, [sede da confermare]',
          reference: 'Reg. (UE) 1169/2011, art. 9',
        },
        {
          label: 'Stabilimento di confezionamento',
          value: 'Frantoio della campagna, indicato in etichetta',
          reference: 'D.Lgs. 145/2017',
        },
      ],
    },
    {
      line: 'miele',
      label: 'Miele',
      elevation: 'Quota di montagna',
      summary: 'Alveari sulle alture di Cerchio, miele smielato a freddo.',
      steps: [
        {
          id: 'apiario',
          title: 'Apiario',
          place: 'Cerchio (AQ)',
          period: 'Tutto l’anno',
          description: 'Tutti i nostri alveari stanno sulle alture di Cerchio.',
        },
        {
          id: 'fioritura',
          title: 'Fioriture',
          place: 'Prati e boschi d’altura',
          period: 'Da maggio a settembre',
          description: 'Le api bottinano sulle fioriture spontanee della stagione.',
        },
        {
          id: 'smielatura',
          title: 'Smielatura',
          place: 'Cerchio',
          period: 'Dopo ogni raccolto',
          description: 'Estrazione a freddo, senza riscaldare il miele.',
        },
        {
          id: 'analisi',
          title: 'Analisi',
          place: 'Laboratorio',
          period: 'Ogni anno',
          description: 'Le analisi confermano anche l’origine floreale dichiarata.',
        },
        {
          id: 'invasettamento',
          title: 'Invasettamento',
          place: '[Laboratorio da confermare]',
          period: 'Dopo la smielatura',
          description: 'Ogni vasetto riceve il codice lotto e il termine minimo di conservazione.',
        },
      ],
      legalInfo: [
        {
          label: 'Denominazione',
          value: 'Miele, con l’origine floreale quando documentata dalle analisi',
          reference: 'D.Lgs. 179/2004, art. 3',
        },
        {
          label: 'Origine',
          value: 'Italia',
          reference: 'D.Lgs. 179/2004, art. 3, come modificato dal D.Lgs. 207/2025',
        },
        {
          label: 'Termine minimo di conservazione',
          value: 'Indicato in etichetta',
          reference: 'Reg. (UE) 1169/2011, art. 9',
        },
        {
          label: 'Dichiarazione nutrizionale',
          value: 'Non obbligatoria: prodotto non trasformato con un solo ingrediente',
          reference: 'Reg. (UE) 1169/2011, all. V',
        },
        {
          label: 'Lotto',
          value: 'Codice preceduto dalla lettera L',
          reference: 'D.Lgs. 231/2017, art. 17',
        },
        {
          label: 'Operatore',
          value: 'Le Quote, Azienda Agricola, [sede da confermare]',
          reference: 'Reg. (UE) 1169/2011, art. 9',
        },
      ],
    },
  ] satisfies FilieraLine[],
  lookup: {
    label: 'Hai una bottiglia o un vasetto? Inserisci il codice lotto',
    placeholder: 'Es. L2026-01',
    submitLabel: 'Cerca il lotto',
    help: 'Lo trovi in etichetta, preceduto dalla lettera L, vicino al termine minimo di conservazione.',
    emptyError: 'Inserisci il codice lotto stampato in etichetta.',
    formatError: 'Il codice non sembra corretto: copialo come sull’etichetta (lettere, numeri, trattini o punti).',
    // La consultazione per lotto arriva con il back office (Fase 3): fino ad allora la ricerca
    // dice onestamente come ottenere le informazioni, senza fingere un risultato.
    pendingTitle: 'Consultazione per lotto in arrivo',
    pendingBody:
      'Stiamo preparando le schede di ogni lotto, con date e analisi. Intanto scrivici indicando il codice e ti rispondiamo noi:',
    email: 'info@lequote.it',
  },
}

// Finestre tipiche, da validare con i titolari: cambiano con l'annata.
export const stagioni = {
  eyebrow: 'Stagioni',
  title: 'Un anno, due quote',
  intro: 'Il calendario cambia con l’annata: queste sono le finestre tipiche dei nostri lavori, al mare e in montagna.',
  currentMonthLabel: 'Mese corrente',
  months: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
  monthsLong: [
    'gennaio',
    'febbraio',
    'marzo',
    'aprile',
    'maggio',
    'giugno',
    'luglio',
    'agosto',
    'settembre',
    'ottobre',
    'novembre',
    'dicembre',
  ],
  tracks: [
    {
      line: 'olio',
      label: 'Olio',
      place: 'Borsacchio, livello del mare',
      activities: [
        { id: 'potatura', label: 'Potatura', from: 2, to: 3 },
        { id: 'fioritura-olivi', label: 'Fioritura degli olivi', from: 5, to: 6 },
        { id: 'raccolta', label: 'Raccolta e molitura', from: 10, to: 11 },
        { id: 'imbottigliamento', label: 'Imbottigliamento', from: 11, to: 12 },
      ],
    },
    {
      line: 'miele',
      label: 'Miele',
      place: 'Cerchio, in quota',
      activities: [
        { id: 'ripresa', label: 'Ripresa delle famiglie', from: 3, to: 4 },
        { id: 'acacia', label: 'Fioritura dell’acacia', from: 5, to: 5 },
        { id: 'millefiori', label: 'Millefiori', from: 6, to: 7 },
        { id: 'melata', label: 'Melata', from: 8, to: 9 },
        { id: 'invernamento', label: 'Invernamento', from: 11, to: 2 },
      ],
    },
  ] satisfies SeasonTrack[],
}

export const domande = {
  eyebrow: 'Domande frequenti',
  title: 'Domande frequenti',
  topics: [
    {
      id: 'ordini',
      label: 'Ordini e consegna',
      items: [
        {
          id: 'come-ordinare',
          question: 'Come posso ordinare?',
          answer:
            'Dalla sezione Shop scegli prodotti e quantità e invia la richiesta: si apre il tuo programma di posta con il riepilogo. Ti rispondiamo per confermare disponibilità, costo della spedizione e modalità di pagamento. Il negozio online con pagamento diretto è in preparazione.',
        },
        {
          id: 'dove-spedite',
          question: 'Dove spedite?',
          answer:
            'In tutta Italia. Se preferisci, puoi ritirare in azienda a Roseto degli Abruzzi o a Cerchio, concordando con noi giorno e orario.',
        },
        {
          id: 'recesso',
          question: 'Posso cambiare idea dopo l’acquisto?',
          answer:
            'Sì. Per gli acquisti a distanza hai 14 giorni dalla consegna per recedere (Codice del Consumo, art. 52): basta scriverci. Le condizioni di vendita complete saranno pubblicate con il negozio online.',
        },
        {
          id: 'visite',
          question: 'Si può venire a trovarvi?',
          answer: 'Sì, su appuntamento: scrivici a info@lequote.it indicando quale delle due sedi vuoi visitare.',
        },
      ],
    },
    {
      id: 'prodotti',
      label: 'Conservazione',
      items: [
        {
          id: 'conservare-olio',
          question: 'Come conservo l’olio?',
          answer:
            'Al riparo dalla luce e dal calore, con il tappo ben chiuso. L’olio dà il meglio nei mesi successivi alla molitura: per questo in etichetta trovi sempre la campagna di raccolta.',
        },
        {
          id: 'miele-cristallizzato',
          question: 'Il miele si è solidificato: è normale?',
          answer:
            'Sì. La cristallizzazione è un processo naturale e non altera il miele; i tempi dipendono dai fiori di origine, e l’acacia per esempio resta liquida a lungo. Se lo preferisci fluido, scalda il vasetto a bagnomaria senza superare i 40 °C.',
        },
      ],
    },
    {
      id: 'tracciabilita',
      label: 'Tracciabilità',
      items: [
        {
          id: 'leggere-lotto',
          question: 'Dove trovo il codice lotto?',
          answer:
            'In etichetta, preceduto dalla lettera L, vicino al termine minimo di conservazione. Identifica la partita: da quel codice risaliamo a raccolta, lavorazione e analisi.',
        },
        {
          id: 'analisi',
          question: 'Posso vedere le analisi?',
          answer:
            'Analizziamo olio e miele ogni anno. Con la consultazione per lotto, in preparazione, i referti dell’annata saranno scaricabili; fino ad allora te li inviamo su richiesta.',
        },
      ],
    },
  ] satisfies FaqTopic[],
}

export const footer = {
  tagline: 'LE QUOTE: Olio e miele, dal mare alla montagna.',
  legal: '© 2026 Le Quote, Azienda Agricola. P.IVA [da inserire].',
  social: [
    { label: 'Instagram', href: '#' },
    { label: 'Facebook', href: '#' },
  ],
}
