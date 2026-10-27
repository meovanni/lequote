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
  ...navItems,
  { id: 'domande', label: 'Domande frequenti' },
  { id: 'contatti', label: 'Contatti' },
]

export const hero = {
  eyebrow: 'Azienda agricola, Abruzzo',
  title: 'Le Quote',
  subtitle: "Dal livello del mare alla quota dell'Appennino abruzzese.",
  body: "Un'azienda agricola familiare divisa tra due territori profondamente diversi: la Riserva Naturale del Borsacchio, sulla costa di Roseto degli Abruzzi, e le alture di Cerchio, nella Marsica. Da qui nascono il nostro olio extravergine e il nostro miele.",
  poster: '/images/oliveto.jpg',
  posterSmall: '/images/oliveto-1080.jpg',
  posterAlt: 'Il viale degli ulivi della Riserva del Borsacchio',
  ctaPrimary: { label: 'Esplora il territorio', href: '#territorio' },
  ctaSecondary: { label: 'Scopri i prodotti ↓', href: '#olio' },
}

// Una sola sezione: il volo sul rilievo dal mare a Cerchio (Territorio). Testi brevi, l'impatto è la mappa.
export const territorio = {
  title: 'Una famiglia, due paesaggi',
  intro: 'Olivi sul mare, api in montagna.',
  places: [
    { id: 'roseto', place: 'Roseto degli Abruzzi', elevation: 'Livello del mare', note: 'Gli olivi della Riserva del Borsacchio, a pochi passi dal mare.' },
    { id: 'cerchio', place: 'Cerchio', elevation: '800 m', note: 'Gli alveari sulle alture marsicane, lontano da fonti di inquinamento.' },
  ],
  closing: 'Ottocento metri di dislivello: per questo ci chiamiamo Le Quote.',
  credit: 'Rilievo: AWS Terrain Tiles. Confini: openpolis, CC BY 4.0.',
}

export const olio = {
  eyebrow: 'Olio extravergine',
  title: 'L’olio della riserva',
  elevation: 'La quota del mare',
  // Acidità e descrittori organolettici richiedono le analisi complete e il panel test
  // dell'annata (Reg. del. UE 2022/2104): sulla scheda prodotto arrivano dai referti pubblicati nel
  // back office, insieme agli altri parametri di qualità.
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
  body: 'I nostri alveari stanno tutti sulle alture di Cerchio, nella Marsica. Produciamo solo millefiori di montagna: le api seguono le fioriture spontanee dei prati e dei boschi d’altura, così il miele racconta la stagione e ogni anno trova sfumature nuove di colore, profumo e consistenza. Sempre smielato a freddo.',
  // Un solo miele, il millefiori di montagna: niente denominazioni monoflora da dimostrare.
  varieties: [
    { name: 'Millefiori di montagna', note: 'l’unico miele che produciamo, dai fiori spontanei in quota' },
    { name: 'La stagione', note: 'primavera ed estate in montagna, in un solo vasetto' },
    { name: 'Ogni anno diverso', note: 'colore e profumo cambiano con le fioriture dell’annata' },
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
    note: 'Il nostro extravergine con acidità 0,2%, dalla Riserva del Borsacchio.',
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
    'Per noi la trasparenza viene prima di tutto. Ogni bottiglia e ogni vasetto portano un codice lotto: da qui vedi da dove viene, chi l’ha lavorato e cosa dicono le analisi di laboratorio, che pubblichiamo.',
  analysesLink: 'Le nostre analisi di laboratorio',
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
          period: 'Settembre, ottobre, secondo l’annata',
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
    placeholder: 'Codice lotto, es. L2026-01',
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
        { id: 'raccolta', label: 'Raccolta e molitura', from: 9, to: 10 },
        { id: 'imbottigliamento', label: 'Imbottigliamento', from: 11, to: 12 },
      ],
    },
    {
      line: 'miele',
      label: 'Miele',
      place: 'Cerchio, in quota',
      activities: [
        { id: 'ripresa', label: 'Ripresa delle famiglie', from: 3, to: 4 },
        { id: 'millefiori', label: 'Fioriture del millefiori', from: 5, to: 8 },
        { id: 'smielatura', label: 'Smielatura a freddo', from: 8, to: 9 },
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
            'Sì. La cristallizzazione è un processo naturale e non altera il miele; i tempi dipendono dai fiori dell’annata, per questo ogni anno il nostro millefiori cristallizza in modo diverso. Se lo preferisci fluido, scalda il vasetto a bagnomaria senza superare i 40 °C.',
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
  nutritionPer: (basis: string) => `per ${basis}`,
  acidityLabel: 'Acidità',
  analysisTitle: 'Analisi dell’annata',
  analysisCampaign: (label: string) => `Campagna ${label}, dal referto di laboratorio`,
  analysisPending: 'I valori dell’annata compaiono qui quando pubblichiamo il referto di laboratorio.',
  analysesLink: 'Tutte le analisi',
  profileTitle: 'Profilo organolettico',
  profileScale: 'Intensità mediana del panel test, su una scala da 0 a 10.',
  profilePending: 'Il profilo dell’annata compare qui quando pubblichiamo il panel test.',
  defectsNone: 'Nessun difetto (mediana 0)',
  unavailable: 'Non disponibile',
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
    // Valore di riserva: sulla pagina vince quello del referto più recente pubblicato.
    acidity: '0,2%' as string | null,
    facts: [
      { label: 'Cultivar', value: 'Moraiolo, Leccino, Pendolino' },
      { label: 'Oliveti', value: 'Riserva del Borsacchio, Roseto degli Abruzzi (TE)' },
      { label: 'Raccolta', value: 'Settembre e ottobre, secondo l’annata, a mano o con agevolatrici' },
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
    summary: 'Solo millefiori di montagna, dagli alveari sulle alture di Cerchio: ogni annata ha le sue sfumature. Smielato a freddo.',
    metaDescription:
      'Miele Le Quote dagli alveari sulle alture di Cerchio (AQ), smielato a freddo. Vasetti da 250 g e 500 g.',
    paragraphs: [
      'Tutti i nostri alveari stanno sulle alture di Cerchio, nella Marsica, e seguono le fioriture spontanee dei prati e dei boschi d’altura.',
      'Produciamo solo millefiori di montagna, per assaporare la stagionalità: ogni anno le fioriture cambiano e il miele trova sfumature nuove. Lo estraiamo a freddo, senza riscaldarlo.',
      'Col tempo il miele può cristallizzare: è un processo naturale. Se lo preferisci fluido, scalda il vasetto a bagnomaria senza superare i 40 °C.',
    ],
    acidity: null as string | null,
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
  /** Acidità di riserva finché non c'è un referto pubblicato; null per il miele. */
  acidity: string | null
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
  allAnalyses: 'Tutte le analisi, campagna per campagna',
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

// Pagina /analisi: i valori dei referti pubblicati nel back office, campagna per campagna.
export const analysisUi = {
  metaTitle: 'Analisi di laboratorio | Le Quote',
  metaDescription: 'I referti di laboratorio dell’olio e del miele Le Quote, campagna per campagna: acidità, perossidi, valori nutrizionali e panel test.',
  title: 'Le nostre analisi',
  intro: 'Ogni campagna facciamo analizzare olio e miele da un laboratorio. Qui pubblichiamo i valori dei referti, così come li riceviamo, e il documento originale da scaricare.',
  loading: 'Carico le analisi…',
  error: 'Non riusciamo a mostrare le analisi in questo momento. Riprova tra poco, oppure scrivici a info@le-quote.it.',
  empty: 'Non ci sono ancora analisi pubblicate. Arrivano con i primi lotti della campagna.',
  lineName: { olio: 'Olio extravergine', miele: 'Miele' } satisfies Record<ProductLine, string>,
  campaign: (label: string) => `Campagna ${label}`,
  groups: {
    chimica: 'Parametri chimici',
    nutrizionale: 'Dichiarazione nutrizionale',
    organolettica: 'Profilo organolettico',
    altro: 'Altri valori',
  },
  nutritionPer: (basis: string) => `Valori medi per ${basis}`,
  openReport: 'Apri il referto',
  backToFiliera: 'Torna alla filiera',
  backHome: 'Torna alla home',
  valueLabels: {
    acidita: 'Acidità libera',
    perossidi: 'Numero di perossidi',
    k232: 'K232',
    k270: 'K270',
    delta_k: 'Delta K',
    etil_esteri: 'Esteri etilici degli acidi grassi',
    cere: 'Cere',
    polifenoli: 'Polifenoli totali',
    umidita: 'Umidità',
    hmf: 'HMF',
    diastasi: 'Attività diastasica',
    conducibilita: 'Conducibilità elettrica',
    origine_botanica: 'Origine botanica',
    energia_kj: 'Energia',
    energia_kcal: 'Energia',
    grassi: 'Grassi',
    saturi: 'di cui acidi grassi saturi',
    monoinsaturi: 'di cui acidi grassi monoinsaturi',
    polinsaturi: 'di cui acidi grassi polinsaturi',
    carboidrati: 'Carboidrati',
    zuccheri: 'di cui zuccheri',
    fibre: 'Fibre',
    proteine: 'Proteine',
    sale: 'Sale',
    fruttato: 'Fruttato',
    amaro: 'Amaro',
    piccante: 'Piccante',
    difetti: 'Mediana dei difetti',
    descrittori: 'Note sensoriali',
  } as Record<string, string>,
  units: { acidita: '% acido oleico' } as Record<string, string>,
}

export const it = {
  meta,
  ui,
  navItems,
  footerNavItems,
  hero,
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
  analysisUi,
}

export type Content = typeof it
