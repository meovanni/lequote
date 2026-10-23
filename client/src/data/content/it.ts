import type {
  ProductLine,
  FaqTopic,
  FilieraLine,
  NavItem,
  SeasonTrack,
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
  email: 'info@le-quote.it',
  phone: '[Telefono da confermare]',
  note: 'Scriveteci per visite, degustazioni o informazioni sui nostri prodotti.',
}

export const shop = {
  eyebrow: 'Shop',
  title: 'Ordina online',
  intro: 'Scegli prodotti e quantità, poi completa l’ordine dal carrello. Prezzi IVA inclusa.',
  summaryTitle: 'Nel carrello',
  summaryCount: (count: number) => (count === 1 ? '1 articolo' : `${count} articoli`),
  totalLabel: 'Totale',
}

// Ogni formato avrà una propria foto (image), non ancora disponibile: lasciata assente
// (ImagePlaceholder mostra il riquadro segnaposto) finché non viene fornita, con il percorso
// atteso indicato nel commento accanto a ciascuna riga, pronto da valorizzare.
export const shopCatalog: ShopProduct[] = [
  {
    id: 'olio',
    handle: 'olio-extravergine',
    name: 'Olio Extravergine',
    note: 'Il blend della riserva: Moraiolo, Leccino e Pendolino.',
    variants: [
      {
        id: 'olio-750ml',

        sku: 'OLIO-750ML',
        label: 'Bottiglia 750 ml',
        imageLabel: 'Foto: Bottiglia di olio EVO Le Quote da 750 ml',
      }, // image: '/images/olio-750ml.jpg'
      {
        id: 'olio-5l',

        sku: 'OLIO-5L',
        label: 'Latta 5 L',
        imageLabel: 'Foto: Latta di olio EVO Le Quote da 5 litri',
      }, // image: '/images/olio-5l.jpg'
    ],
  },
  {
    id: 'miele',
    handle: 'miele',
    name: 'Miele',
    note: 'Smielato a freddo, per preservarne enzimi e aromi.',
    variants: [
      {
        id: 'miele-250g',

        sku: 'MIELE-250G',
        label: 'Vasetto 250 g',
        imageLabel: 'Foto: Vasetto di miele Le Quote da 250 g',
      }, // image: '/images/miele-250g.jpg'
      {
        id: 'miele-500g',

        sku: 'MIELE-500G',
        label: 'Vasetto 500 g',
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
            'Nello Shop scegli prodotti e quantità e completa l’ordine dal carrello. Puoi pagare con bonifico bancario: trovi le coordinate nella pagina di conferma e prepariamo l’ordine quando il pagamento è accreditato. Oppure prenoti i prodotti e li ritiri in una delle nostre sedi, a Roseto degli Abruzzi o a Cerchio, pagando al ritiro.',
        },
        {
          id: 'dove-spedite',
          question: 'Spedite a domicilio?',
          answer:
            'Non ancora: per ora gli ordini si ritirano in azienda, a Roseto degli Abruzzi o a Cerchio. Quando l’ordine è pronto ti scriviamo per concordare giorno e orario.',
        },
        {
          id: 'recesso',
          question: 'Posso cambiare idea dopo l’acquisto?',
          answer:
            'Sì. Per gli acquisti online hai 14 giorni da quando ritiri o ricevi i prodotti per recedere (Codice del Consumo, art. 52), senza indicarne il motivo: usa il modulo di recesso in fondo alla pagina o scrivici. I dettagli sono nelle condizioni di vendita, sempre in fondo alla pagina.',
        },
        {
          id: 'visite',
          question: 'Si può venire a trovarvi?',
          answer: 'Sì, su appuntamento: scrivici a info@le-quote.it indicando quale delle due sedi vuoi visitare.',
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

export const meta = {
  title: "Le Quote | Olio e Miele dal Borsacchio all'Appennino",
  description:
    "Le Quote, azienda agricola familiare tra la Riserva del Borsacchio e Cerchio (AQ): olio extravergine d'oliva e miele, dal mare alla montagna abruzzese.",
}

// Testi dell'interfaccia che non appartengono a una sezione.
export const ui = {
  skipLink: 'Salta al contenuto',
  menuOpen: 'Apri il menu',
  menuClose: 'Chiudi il menu',
  mainNavLabel: 'Menu principale',
  footerNavLabel: 'Menu footer',
  languageLabel: 'Lingua',
  languageNames: { it: 'Italiano', en: 'English', de: 'Deutsch' },
  filieraTablistLabel: 'Linea di prodotto',
  seasonActive: 'In corso',
  periodRange: (from: string, to: string) => `da ${from} a ${to}`,
  oilBottleLabel: 'Bottiglia da 750 ml di olio extravergine Le Quote',
  honeyJarLabel: 'Vasetto di miele Le Quote',
  notFoundTitle: 'Pagina non trovata',
  notFoundBody: 'L’indirizzo non corrisponde a nessuna pagina del sito.',
  errorTitle: 'Qualcosa non ha funzionato',
  errorBody: 'Ricarica la pagina; se il problema resta, scrivici a info@le-quote.it.',
  backHome: 'Torna alla home',
  adminLink: 'Area riservata',
}

// Schede prodotto (/prodotti/:handle). I testi stanno qui, tradotti; varianti, prezzi e
// disponibilità arrivano da Medusa. Gli handle sono quelli del catalogo nel back office.
// Niente dichiarazioni non documentabili: niente "estratto a freddo" senza il registro delle
// temperature (Reg. del. UE 2022/2104, art. 6), niente acidità senza le analisi dell'annata.
export const productUi = {
  formatLabel: 'Formato',
  taxIncluded: 'IVA inclusa',
  loading: 'Carico prezzi e disponibilità…',
  loadError:
    'Prezzi e disponibilità non sono raggiungibili in questo momento. Riprova più tardi o scrivici a info@le-quote.it.',
  available: 'Disponibile',
  lowStock: (count: number) => (count === 1 ? 'Ultimo pezzo' : `Ultimi ${count} pezzi`),
  soldOut: 'Esaurito al momento',
  notOnSale: 'Non ancora in vendita',
  detailsTitle: 'In breve',
  nutritionTitle: 'Dichiarazione nutrizionale',
  nutritionNutrient: 'Valori medi',
  traceTitle: 'Da dove viene',
  traceBody:
    'In etichetta trovi il codice lotto: inseriscilo nella sezione Filiera per vedere raccolta, lavorazione e analisi della tua bottiglia o del tuo vasetto.',
  traceLink: 'Vai alla filiera',
  backToShop: 'Torna allo shop',
}

export const products = {
  'olio-extravergine': {
    line: 'olio',
    illustration: 'oil',
    eyebrow: 'Olio extravergine',
    name: 'Olio extravergine di oliva',
    summary: 'Il blend della Riserva del Borsacchio: Moraiolo, Leccino e Pendolino, solo dai nostri oliveti.',
    metaDescription:
      'Olio extravergine di oliva Le Quote: olive dei nostri oliveti nella Riserva del Borsacchio, Roseto degli Abruzzi. Bottiglia da 750 ml e latta da 5 litri.',
    paragraphs: [
      'Le olive vengono solo dai nostri oliveti nella Riserva del Borsacchio, a pochi passi dal mare, alcuni con piante secolari. Non compriamo olive da altri produttori.',
      'Raccogliamo a mano o con leggere agevolatrici, al giusto grado di maturazione, e portiamo le olive al frantoio entro poche ore. Il frantoio cambia di anno in anno: per ogni lotto indichiamo quale.',
      'Ogni campagna l’olio viene analizzato in laboratorio. I referti dell’annata si consultano per lotto, dalla sezione Filiera.',
    ],
    facts: [
      { label: 'Cultivar', value: 'Moraiolo, Leccino, Pendolino' },
      { label: 'Oliveti', value: 'Riserva del Borsacchio, Roseto degli Abruzzi (TE)' },
      { label: 'Raccolta', value: 'Ottobre e novembre, a mano o con agevolatrici' },
      { label: 'Estrazione', value: 'Solo meccanica, entro poche ore dalla raccolta' },
    ],
    // Valori per 100 ml dalle analisi dell'annata (Reg. UE 1169/2011, art. 30 e all. XV): non
    // ancora forniti, restano segnaposto visibili.
    nutrition: {
      per: 'per 100 ml',
      rows: [
        { label: 'Energia', value: '[kJ / kcal da analisi]' },
        { label: 'Grassi', value: '[g da analisi]' },
        { label: 'di cui acidi grassi saturi', value: '[g da analisi]' },
        { label: 'Carboidrati', value: '[g da analisi]' },
        { label: 'di cui zuccheri', value: '[g da analisi]' },
        { label: 'Proteine', value: '[g da analisi]' },
        { label: 'Sale', value: '[g da analisi]' },
      ],
    } as { per: string; rows: { label: string; value: string }[] } | null,
    variantLabels: { 'OLIO-750ML': 'Bottiglia 750 ml', 'OLIO-5L': 'Latta 5 L' } as Record<string, string>,
  },
  miele: {
    line: 'miele',
    illustration: 'honey',
    eyebrow: 'Miele',
    name: 'Miele di quota',
    summary: 'Dagli alveari sulle alture di Cerchio, smielato a freddo. Acacia, millefiori o melata secondo l’annata.',
    metaDescription:
      'Miele Le Quote dagli alveari sulle alture di Cerchio (AQ), smielato a freddo. Vasetti da 250 g e 500 g.',
    paragraphs: [
      'Tutti i nostri alveari stanno sulle alture di Cerchio, nell’entroterra aquilano, e seguono le fioriture spontanee dei prati e dei boschi d’altura.',
      'Estraiamo il miele a freddo, senza riscaldarlo. La denominazione floreale, per esempio acacia, la indichiamo solo quando le analisi dell’annata la confermano; altrimenti è millefiori.',
      'Col tempo il miele può cristallizzare: è un processo naturale. Se lo preferisci fluido, scalda il vasetto a bagnomaria senza superare i 40 °C.',
    ],
    facts: [
      { label: 'Apiari', value: 'Cerchio (AQ), in quota' },
      { label: 'Fioriture', value: 'Spontanee, da maggio a settembre' },
      { label: 'Smielatura', value: 'A freddo, dopo ogni raccolto' },
      { label: 'Conservazione', value: 'In luogo fresco e asciutto, lontano dalla luce' },
    ],
    // Prodotto non trasformato con un solo ingrediente: dichiarazione non obbligatoria (all. V).
    nutrition: null as { per: string; rows: { label: string; value: string }[] } | null,
    variantLabels: { 'MIELE-250G': 'Vasetto 250 g', 'MIELE-500G': 'Vasetto 500 g' } as Record<string, string>,
  },
} satisfies Record<string, ProductPage>

export interface ProductPage {
  line: ProductLine
  illustration: 'oil' | 'honey'
  eyebrow: string
  name: string
  summary: string
  metaDescription: string
  paragraphs: string[]
  facts: { label: string; value: string }[]
  nutrition: { per: string; rows: { label: string; value: string }[] } | null
  variantLabels: Record<string, string>
}

// Carrello, checkout e conferma (/carrello, /ordine). Testi legali da validare con il consulente:
// il pulsante finale segue l'art. 51, c. 2 del Codice del Consumo ("obbligo di pagamento").
export const cartUi = {
  navText: 'Carrello',
  navLabel: (count: number) =>
    count === 0 ? 'Carrello, vuoto' : `Carrello, ${count} ${count === 1 ? 'articolo' : 'articoli'}`,
  addToCart: 'Aggiungi al carrello',
  addShort: 'Aggiungi',
  adding: 'Aggiungo…',
  added: 'Aggiunto al carrello.',
  goToCart: 'Vai al carrello',
  addError: 'Non siamo riusciti ad aggiungere il prodotto. Riprova tra poco.',
  updateError: 'Non siamo riusciti ad aggiornare il carrello. Riprova tra poco.',
  quantityLabel: 'Quantità',
  decrease: (item: string) => `Diminuisci quantità: ${item}`,
  increase: (item: string) => `Aumenta quantità: ${item}`,
  title: 'Il tuo carrello',
  metaDescription: 'Carrello e ordine sul sito di Le Quote: olio extravergine e miele, con ritiro in azienda.',
  loading: 'Carico il carrello…',
  empty: 'Il carrello è vuoto.',
  emptyLink: 'Scegli i prodotti',
  remove: 'Rimuovi',
  itemsTitle: 'Prodotti',
  subtotal: 'Prodotti',
  shipping: 'Consegna',
  shippingFree: 'Gratuita',
  shippingTbd: 'Da scegliere',
  total: 'Totale',
  taxIncluded: (amount: string) => `IVA inclusa (${amount})`,
  continueShopping: 'Continua gli acquisti',
}

export const checkoutUi = {
  contactTitle: 'I tuoi dati',
  firstName: 'Nome',
  lastName: 'Cognome',
  email: 'Email',
  emailHelp: 'Ti scriviamo qui per confermare l’ordine.',
  phone: 'Telefono',
  phoneHelp: 'Per accordarci sul ritiro o sulla consegna.',
  deliveryTitle: 'Come lo ricevi',
  deliveryLoading: 'Carico le opzioni di consegna…',
  pickupLabel: (city: string) => `Ritiro a ${city}`,
  pickupNote: 'Gratuito. Ti scriviamo quando è pronto. Orari: [da confermare].',
  deliveryNote: 'Spedizione in tutta Italia.',
  noDelivery: 'La spedizione a domicilio non è ancora attiva: per ora l’ordine si ritira in azienda.',
  addressTitle: 'Indirizzo di consegna',
  address: 'Via e numero civico',
  postalCode: 'CAP',
  city: 'Comune',
  province: 'Provincia (sigla)',
  paymentTitle: 'Come paghi',
  paymentOptions: {
    bonifico: {
      label: 'Bonifico bancario',
      note: 'Trovi le coordinate nella pagina di conferma. Prepariamo l’ordine quando il pagamento è accreditato.',
    },
    ritiro: {
      label: 'Al ritiro',
      note: 'Paghi in azienda quando ritiri l’ordine: [contanti e/o carta, da confermare].',
    },
  },
  pickupOnly: 'Solo con il ritiro in azienda.',
  termsBefore: 'Ho letto e accetto le ',
  termsLink: 'condizioni di vendita',
  termsMiddle: '. Ho letto l’',
  privacyLink: 'informativa sulla privacy',
  termsAfter: '.',
  withdrawalNote:
    'Puoi recedere entro 14 giorni da quando ricevi o ritiri i prodotti, senza indicarne il motivo, salvo per le confezioni sigillate aperte dopo la consegna. ',
  withdrawalLink: 'Come recedere',
  submit: 'Ordina con obbligo di pagamento',
  submitting: 'Invio l’ordine…',
  errorSummary: 'Controlla i campi segnalati.',
  errors: {
    required: 'Campo obbligatorio.',
    email: 'Inserisci un indirizzo email valido.',
    postalCode: 'Il CAP ha 5 cifre.',
    province: 'Indica la sigla della provincia, per esempio TE.',
    delivery: 'Scegli come ricevere l’ordine.',
    payment: 'Scegli come pagare.',
    terms: 'Per ordinare accetta le condizioni di vendita.',
    submit:
      'L’ordine non è andato a buon fine e non ti è stato addebitato nulla. Riprova, oppure scrivici a info@le-quote.it.',
  },
}

export const orderUi = {
  title: 'Ordine ricevuto',
  metaDescription: 'Conferma dell’ordine su Le Quote.',
  number: (id: number) => `Ordine n. ${id}`,
  body: (email: string) => `Grazie. Ti scriviamo a ${email} quando l’ordine è pronto.`,
  loading: 'Carico l’ordine…',
  missing: 'Non c’è nessun ordine da mostrare.',
  error:
    'Non riusciamo a mostrare l’ordine in questo momento. Se hai appena ordinato, l’ordine è registrato: ti scriviamo noi. Per dubbi: info@le-quote.it.',
  bankTitle: 'Coordinate per il bonifico',
  bankHolder: 'Intestatario',
  bankIban: 'IBAN',
  bankReason: 'Causale',
  bankReasonValue: (id: number) => `Ordine ${id} Le Quote`,
  bankAmount: 'Importo',
  bankNote: 'Prepariamo l’ordine quando il bonifico risulta accreditato.',
  pickupPaymentTitle: 'Pagamento al ritiro',
  pickupPaymentBody: 'Paghi in azienda quando ritiri l’ordine: [contanti e/o carta, da confermare].',
  deliveryLabel: 'Consegna',
  summaryTitle: 'Riepilogo',
  backHome: 'Torna alla home',
}

// /lotto/:codice, aperta dal QR in etichetta. Nomi delle fasi, campi e informazioni di legge
// arrivano dal back office così come li scrivono i titolari, in italiano.
export const lotUi = {
  metaTitle: (code: string) => `Lotto ${code} | Le Quote`,
  metaDescription: 'Il percorso di un lotto Le Quote: campagna, fasi di lavorazione, analisi e informazioni di legge.',
  eyebrow: 'Tracciabilità del lotto',
  lineName: { olio: 'Olio extravergine di oliva', miele: 'Miele' } satisfies Record<ProductLine, string>,
  campaign: (label: string) => `Campagna ${label}`,
  stagesTitle: 'Il percorso',
  noStages: 'Le fasi di questo lotto non sono ancora state descritte.',
  analysesTitle: 'Analisi',
  openAnalysis: 'Apri il referto',
  legalLabel: 'Informazioni di legge',
  sourceNote: '',
  loading: 'Carico il lotto…',
  notFoundTitle: 'Lotto non trovato',
  notFoundBody: (code: string) =>
    `Non c’è nessun lotto pubblicato con codice ${code}. Controlla il codice in etichetta, oppure scrivici a info@le-quote.it.`,
  invalidBody: 'Questo indirizzo non contiene un codice lotto valido.',
  error: 'Non riusciamo a mostrare il lotto in questo momento. Riprova tra poco, oppure scrivici a info@le-quote.it.',
  searchAgain: 'Cerca un altro lotto',
  backHome: 'Torna alla home',
}

export const it = {
  meta,
  ui,
  navItems,
  footerNavItems,
  hero,
  chiSiamo,
  territorio,
  olio,
  miele,
  contatti,
  shop,
  shopCatalog,
  filiera,
  stagioni,
  domande,
  footer,
  productUi,
  products,
  cartUi,
  checkoutUi,
  orderUi,
  lotUi,
}

export type Content = typeof it
