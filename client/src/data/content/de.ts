import type { Content } from './it'

// Deutsche Übersetzung von it.ts. Gleiche ids und Struktur; maßgeblich ist die italienische
// Datei, die Rechtsverweise bleiben wie im italienischen Recht veröffentlicht.
export const de: Content = {
  meta: {
    title: 'Le Quote | Olivenöl und Honig vom Borsacchio bis zum Apennin',
    description:
      'Le Quote, ein Familienbetrieb zwischen dem Naturreservat Borsacchio und Cerchio (AQ): natives Olivenöl extra und Honig, vom Meer bis in die Berge der Abruzzen.',
  },

  ui: {
    skipLink: 'Zum Inhalt springen',
    menuOpen: 'Menü öffnen',
    menuClose: 'Menü schließen',
    mainNavLabel: 'Hauptmenü',
    footerNavLabel: 'Fußzeilenmenü',
    languageLabel: 'Sprache',
    languageNames: { it: 'Italiano', en: 'English', de: 'Deutsch' },
    filieraTablistLabel: 'Produktlinie',
    seasonActive: 'Jetzt',
    periodRange: (from, to) => `${from} bis ${to}`,
    oilBottleLabel: 'Eine 750-ml-Flasche natives Olivenöl extra von Le Quote',
    honeyJarLabel: 'Ein Glas Honig von Le Quote',
    notFoundTitle: 'Seite nicht gefunden',
    notFoundBody: 'Diese Adresse gehört zu keiner Seite der Website.',
    errorTitle: 'Etwas ist schiefgelaufen',
    errorBody: 'Laden Sie die Seite neu; besteht das Problem weiter, schreiben Sie uns an info@le-quote.it.',
    backHome: 'Zur Startseite',
    adminLink: 'Interner Bereich',
  },

  navItems: [
    { id: 'territorio', label: 'Land' },
    { id: 'olio', label: 'Öl' },
    { id: 'miele', label: 'Honig' },
    { id: 'filiera', label: 'Herkunft' },
    { id: 'stagioni', label: 'Jahreszeiten' },
    { id: 'shop', label: 'Shop' },
  ],

  footerNavItems: [
    { id: 'chi-siamo', label: 'Über uns' },
    { id: 'territorio', label: 'Land' },
    { id: 'olio', label: 'Öl' },
    { id: 'miele', label: 'Honig' },
    { id: 'filiera', label: 'Herkunft' },
    { id: 'stagioni', label: 'Jahreszeiten' },
    { id: 'shop', label: 'Shop' },
    { id: 'domande', label: 'Häufige Fragen' },
    { id: 'contatti', label: 'Kontakt' },
  ],

  hero: {
    eyebrow: 'Landwirtschaftlicher Familienbetrieb, Abruzzen',
    title: 'Le Quote',
    subtitle: 'Vom Meeresspiegel bis auf die Höhen des Abruzzen-Apennins.',
    body: 'Ein Familienbetrieb an zwei sehr unterschiedlichen Orten: im Naturreservat Borsacchio an der Küste von Roseto degli Abruzzi und auf den Anhöhen von Cerchio im Hinterland von L’Aquila. Von hier kommen unser natives Olivenöl extra und unser Honig.',
    poster: '/images/oliveto.jpg',
    posterAlt: 'Die Olivenbaumallee im Reservat Borsacchio',
    ctaPrimary: { label: 'Das Land entdecken', href: '#territorio' },
    ctaSecondary: { label: 'Zu den Produkten ↓', href: '#olio' },
  },

  chiSiamo: {
    eyebrow: 'Über uns',
    title: 'Eine Familie, zwei Landschaften',
    paragraphs: [
      'Le Quote entstand aus einer einfachen Entscheidung: dem Land treu zu bleiben, auf welcher Höhe es auch liegt. Auf der einen Seite der salzige Wind der Adriaküste, auf der anderen die dünne Luft der Apenninhöhen: zwei Landschaften, die gegensätzlich wirken und für uns doch dasselbe Zuhause sind.',
      'An der Küste bauen wir Oliven an, in den Bergen pflegen wir unsere Bienenvölker, im Rhythmus der Jahreszeiten. Keine Abkürzungen: nur die Zeit, die eine Frucht oder eine Wabe braucht, um so zu reifen, wie sie soll.',
      'Der Name Le Quote, „die Höhenlagen“, erzählt genau das: Der Betrieb lebt auf verschiedenen Höhen, vom Meeresspiegel bis auf achthundert Meter, und aus diesem Abstand entsteht die Vielfalt unserer Produkte.',
    ],
    imageLabel: 'Foto: Die tägliche Arbeit zwischen Olivenhainen und Bienenstöcken',
  },

  territorio: {
    eyebrow: 'Land',
    title: 'Zwei Höhen, ein Land',
    intro: 'Achthundert Höhenmeter trennen unsere beiden Standorte. Genug, um von zwei Welten zu erzählen.',
    imageOliveto: '/images/oliveto.jpg',
    imageOlivetoLabel: 'Foto: Die Olivenbaumallee im Reservat Borsacchio',
    imageApiario: '/images/arnie.jpg',
    imageApiarioLabel: 'Foto: Die Bienenstöcke auf den Höhen von Cerchio',
    markers: [
      {
        id: 'roseto',
        place: 'Roseto degli Abruzzi',
        note: 'Das Reservat Borsacchio, zwischen Macchia und Olivenhainen nur wenige Schritte vom Meer.',
      },
      {
        id: 'cerchio',
        place: 'Cerchio',
        note: 'Die Anhöhen im Hinterland von L’Aquila, wo die Bienen die Honige der Höhenlagen sammeln.',
      },
    ],
  },

  olio: {
    eyebrow: 'Natives Olivenöl extra',
    title: 'Das Öl des Reservats',
    elevation: 'Auf Meereshöhe',
    body: 'Wir verwenden nur Oliven aus unseren eigenen Hainen, einige mit jahrhundertealten Bäumen. Wir ernten sie von Hand oder mit leichten Erntehilfen, im richtigen Reifegrad, und bringen sie innerhalb weniger Stunden zur Ölmühle. Jede Saison wird das Öl im Labor untersucht.',
    varieties: [
      { name: 'Moraiolo', note: 'traditionelle Sorte Mittelitaliens' },
      { name: 'Leccino', note: 'robuster Baum, verträgt Kälte gut' },
      { name: 'Pendolino', note: 'Bestäuber für die anderen Olivenbäume im Hain' },
    ],
    imageLabel: 'Foto: Flasche natives Olivenöl extra von Le Quote',
    imageLabelAlt: 'Foto: Flasche natives Olivenöl extra von Le Quote, Rückseite',
    image: '/images/bottiglia1.png',
    imageAlt: '/images/bottiglia2.png',
  },

  miele: {
    eyebrow: 'Honig',
    title: 'Honig aus der Höhe',
    elevation: 'Im Gebirge',
    body: 'Alle unsere Bienenvölker stehen auf den Höhen von Cerchio im Hinterland von L’Aquila und folgen den wilden Blüten der Bergwiesen und -wälder. Wir ernten Honige, die sich in Farbe, Duft und Konsistenz unterscheiden, immer kalt geschleudert.',
    varieties: [
      { name: 'Akazienhonig', note: 'hell und mild, bleibt lange flüssig' },
      { name: 'Blütenhonig', note: 'wechselt mit den Blüten jeder Saison' },
      { name: 'Honigtauhonig', note: 'dunkel, am Ende des Sommers geerntet' },
    ],
    imageLabel: 'Foto: Die Bienenstöcke auf den Höhen von Cerchio',
    imageLabelAlt: 'Foto: Honiggläser von Le Quote',
    image: '/images/arnie.jpg',
    imageAlt: '/images/miele.png',
  },

  contatti: {
    eyebrow: 'Kontakt',
    title: 'Besuchen Sie uns, auf jeder Höhe',
    email: 'info@le-quote.it',
    phone: '[Telefon noch zu bestätigen]',
    note: 'Schreiben Sie uns für Besuche, Verkostungen oder Informationen zu unseren Produkten.',
  },

  shop: {
    eyebrow: 'Shop',
    title: 'Online bestellen',
    intro: 'Wählen Sie Produkte und Mengen und schließen Sie die Bestellung im Warenkorb ab. Preise inkl. MwSt.',
    summaryTitle: 'Im Warenkorb',
    summaryCount: (count: number) => `${count} Artikel`,
    totalLabel: 'Gesamt',
  },

  shopCatalog: [
    {
      id: 'olio',
      handle: 'olio-extravergine',
      name: 'Natives Olivenöl extra',
      note: 'Die Cuvée des Reservats: Moraiolo, Leccino und Pendolino.',
      variants: [
        {
          id: 'olio-750ml',
          sku: 'OLIO-750ML',
          label: 'Flasche 750 ml',
          imageLabel: 'Foto: 750-ml-Flasche natives Olivenöl extra von Le Quote',
        },
        {
          id: 'olio-5l',
          sku: 'OLIO-5L',
          label: 'Kanister 5 L',
          imageLabel: 'Foto: 5-Liter-Kanister natives Olivenöl extra von Le Quote',
        },
      ],
    },
    {
      id: 'miele',
      handle: 'miele',
      name: 'Honig',
      note: 'Kalt geschleudert, um Enzyme und Aromen zu erhalten.',
      variants: [
        {
          id: 'miele-250g',
          sku: 'MIELE-250G',
          label: 'Glas 250 g',
          imageLabel: 'Foto: 250-g-Glas Honig von Le Quote',
        },
        {
          id: 'miele-500g',
          sku: 'MIELE-500G',
          label: 'Glas 500 g',
          imageLabel: 'Foto: 500-g-Glas Honig von Le Quote',
        },
      ],
    },
  ],

  filiera: {
    eyebrow: 'Herkunft',
    title: 'Vom Baum bis zu Ihrer Charge',
    intro:
      'Jede Flasche und jedes Glas trägt eine Chargennummer. Hier sehen Sie den Weg jedes Produkts, vom Feld bis zum Etikett.',
    legalPanelLabel: 'Pflichtangaben',
    internalNote:
      'Zu jeder Charge führen wir auch die Aufzeichnungen, die die Kontrollbehörden verlangen (VO (EG) 178/2002, Art. 18): Sie bleiben intern und werden nicht veröffentlicht.',
    lines: [
      {
        line: 'olio',
        label: 'Natives Olivenöl extra',
        elevation: 'Meereshöhe',
        summary: 'Nur Oliven aus unseren eigenen Hainen, gemahlen in einer für jede Saison gewählten Ölmühle.',
        steps: [
          {
            id: 'oliveto',
            title: 'Olivenhain',
            place: 'Reservat Borsacchio, Roseto degli Abruzzi',
            period: 'Das ganze Jahr',
            description: 'Wir bewirtschaften nur unsere eigenen Bäume: Wir kaufen keine Oliven von anderen Erzeugern.',
          },
          {
            id: 'raccolta',
            title: 'Ernte',
            place: 'Borsacchio',
            period: 'Oktober, November',
            description: 'Von Hand oder mit leichten Erntehilfen, im richtigen Reifegrad.',
          },
          {
            id: 'molitura',
            title: 'Mahlen',
            place: 'Ölmühle der Saison',
            period: 'Innerhalb weniger Stunden',
            description: 'Die Ölmühle wechselt von Jahr zu Jahr: Für jede Charge geben wir an, welche.',
          },
          {
            id: 'analisi',
            title: 'Analysen',
            place: 'Labor',
            period: 'Jede Saison',
            description: 'Chemische und sensorische Analysen des Öls des Jahrgangs.',
          },
          {
            id: 'imbottigliamento',
            title: 'Abfüllung',
            place: 'In der Ölmühle',
            period: 'Nach dem Mahlen',
            description: 'Jede Flasche erhält die Chargennummer und das Mindesthaltbarkeitsdatum.',
          },
        ],
        legalInfo: [
          {
            label: 'Bezeichnung',
            value: 'Natives Olivenöl extra',
            reference: 'Del. VO (EU) 2022/2104, Art. 5',
          },
          {
            label: 'Kategorie',
            value: 'Olivenöl der höchsten Güteklasse, direkt aus Oliven ausschließlich mit mechanischen Verfahren gewonnen',
            reference: 'Del. VO (EU) 2022/2104, Art. 5',
          },
          {
            label: 'Herkunft',
            value: 'Italien: Oliven in Italien geerntet und gemahlen',
            reference: 'Del. VO (EU) 2022/2104, Art. 8; Gesetz 9/2013, Art. 1',
          },
          {
            label: 'Erntejahr',
            value: 'Auf dem Etikett angegeben, vor dem Mindesthaltbarkeitsdatum',
            reference: 'Gesetz 9/2013, Art. 7',
          },
          {
            label: 'Aufbewahrung',
            value: 'Vor Licht und Wärme geschützt',
            reference: 'Del. VO (EU) 2022/2104, Art. 7',
          },
          {
            label: 'Nährwertdeklaration',
            value: 'Auf dem Etikett und auf der Produktseite, je 100 ml',
            reference: 'VO (EU) 1169/2011, Art. 30',
          },
          {
            label: 'Charge',
            value: 'Nummer mit vorangestelltem Buchstaben L',
            reference: 'Gesetzesdekret 231/2017, Art. 17',
          },
          {
            label: 'Lebensmittelunternehmer',
            value: 'Le Quote, Azienda Agricola, [Anschrift noch zu bestätigen]',
            reference: 'VO (EU) 1169/2011, Art. 9',
          },
          {
            label: 'Abfüllbetrieb',
            value: 'Ölmühle der Saison, auf dem Etikett angegeben',
            reference: 'Gesetzesdekret 145/2017',
          },
        ],
      },
      {
        line: 'miele',
        label: 'Honig',
        elevation: 'Im Gebirge',
        summary: 'Bienenstöcke auf den Höhen von Cerchio, Honig kalt geschleudert.',
        steps: [
          {
            id: 'apiario',
            title: 'Bienenstand',
            place: 'Cerchio (AQ)',
            period: 'Das ganze Jahr',
            description: 'Alle unsere Bienenvölker stehen auf den Höhen von Cerchio.',
          },
          {
            id: 'fioritura',
            title: 'Blüten',
            place: 'Bergwiesen und -wälder',
            period: 'Mai bis September',
            description: 'Die Bienen sammeln an den wilden Blüten der Saison.',
          },
          {
            id: 'smielatura',
            title: 'Schleudern',
            place: 'Cerchio',
            period: 'Nach jeder Ernte',
            description: 'Kalte Gewinnung, ohne den Honig zu erwärmen.',
          },
          {
            id: 'analisi',
            title: 'Analysen',
            place: 'Labor',
            period: 'Jedes Jahr',
            description: 'Die Analysen bestätigen auch die angegebene Blütenherkunft.',
          },
          {
            id: 'invasettamento',
            title: 'Abfüllung',
            place: '[Betrieb noch zu bestätigen]',
            period: 'Nach dem Schleudern',
            description: 'Jedes Glas erhält die Chargennummer und das Mindesthaltbarkeitsdatum.',
          },
        ],
        legalInfo: [
          {
            label: 'Bezeichnung',
            value: 'Honig, mit Blütenherkunft, wenn sie durch Analysen belegt ist',
            reference: 'Gesetzesdekret 179/2004, Art. 3',
          },
          {
            label: 'Herkunft',
            value: 'Italien',
            reference: 'Gesetzesdekret 179/2004, Art. 3, geändert durch Gesetzesdekret 207/2025',
          },
          {
            label: 'Mindesthaltbarkeit',
            value: 'Auf dem Etikett angegeben',
            reference: 'VO (EU) 1169/2011, Art. 9',
          },
          {
            label: 'Nährwertdeklaration',
            value: 'Nicht verpflichtend: unverarbeitetes Erzeugnis aus einer einzigen Zutat',
            reference: 'VO (EU) 1169/2011, Anhang V',
          },
          {
            label: 'Charge',
            value: 'Nummer mit vorangestelltem Buchstaben L',
            reference: 'Gesetzesdekret 231/2017, Art. 17',
          },
          {
            label: 'Lebensmittelunternehmer',
            value: 'Le Quote, Azienda Agricola, [Anschrift noch zu bestätigen]',
            reference: 'VO (EU) 1169/2011, Art. 9',
          },
        ],
      },
    ],
    lookup: {
      label: 'Sie haben eine Flasche oder ein Glas? Geben Sie die Chargennummer ein',
      placeholder: 'z. B. L2026-01',
      submitLabel: 'Charge suchen',
      help: 'Sie steht auf dem Etikett, mit vorangestelltem L, neben dem Mindesthaltbarkeitsdatum.',
      emptyError: 'Geben Sie die auf dem Etikett gedruckte Chargennummer ein.',
      formatError: 'Die Nummer scheint nicht zu stimmen: Übernehmen Sie sie wie auf dem Etikett (Buchstaben, Ziffern, Bindestriche oder Punkte).',
    },
  },

  stagioni: {
    eyebrow: 'Jahreszeiten',
    title: 'Ein Jahr, zwei Höhen',
    intro: 'Der Kalender ändert sich mit jedem Jahrgang: Dies sind die üblichen Zeitfenster unserer Arbeit, am Meer und in den Bergen.',
    currentMonthLabel: 'Aktueller Monat',
    months: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    monthsLong: [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember',
    ],
    tracks: [
      {
        line: 'olio',
        label: 'Öl',
        place: 'Borsacchio, Meereshöhe',
        activities: [
          { id: 'potatura', label: 'Baumschnitt', from: 2, to: 3 },
          { id: 'fioritura-olivi', label: 'Olivenblüte', from: 5, to: 6 },
          { id: 'raccolta', label: 'Ernte und Mahlen', from: 10, to: 11 },
          { id: 'imbottigliamento', label: 'Abfüllung', from: 11, to: 12 },
        ],
      },
      {
        line: 'miele',
        label: 'Honig',
        place: 'Cerchio, in der Höhe',
        activities: [
          { id: 'ripresa', label: 'Frühjahrsentwicklung der Völker', from: 3, to: 4 },
          { id: 'acacia', label: 'Akazienblüte', from: 5, to: 5 },
          { id: 'millefiori', label: 'Blütenhonig', from: 6, to: 7 },
          { id: 'melata', label: 'Honigtau', from: 8, to: 9 },
          { id: 'invernamento', label: 'Einwinterung', from: 11, to: 2 },
        ],
      },
    ],
  },

  domande: {
    eyebrow: 'Häufige Fragen',
    title: 'Häufige Fragen',
    topics: [
      {
        id: 'ordini',
        label: 'Bestellung und Lieferung',
        items: [
          {
            id: 'come-ordinare',
            question: 'Wie kann ich bestellen?',
            answer:
              'Wählen Sie im Bereich Shop Produkte und Mengen und senden Sie die Anfrage: Ihr E-Mail-Programm öffnet sich mit der Zusammenfassung. Wir antworten und bestätigen Verfügbarkeit, Versandkosten und Zahlungsart. Ein Onlineshop mit direkter Bezahlung ist in Vorbereitung.',
          },
          {
            id: 'dove-spedite',
            question: 'Wohin liefern Sie?',
            answer:
              'In ganz Italien. Wenn Sie möchten, können Sie im Betrieb in Roseto degli Abruzzi oder in Cerchio abholen, nach Absprache von Tag und Uhrzeit.',
          },
          {
            id: 'recesso',
            question: 'Kann ich nach dem Kauf zurücktreten?',
            answer:
              'Ja. Bei Fernabsatzkäufen haben Sie 14 Tage ab Lieferung, um zu widerrufen (italienisches Verbrauchergesetzbuch, Art. 52): Schreiben Sie uns einfach. Die vollständigen Verkaufsbedingungen erscheinen mit dem Onlineshop.',
          },
          {
            id: 'visite',
            question: 'Kann man Sie besuchen?',
            answer: 'Ja, nach Vereinbarung: Schreiben Sie an info@le-quote.it und geben Sie an, welchen der beiden Standorte Sie besuchen möchten.',
          },
        ],
      },
      {
        id: 'prodotti',
        label: 'Aufbewahrung',
        items: [
          {
            id: 'conservare-olio',
            question: 'Wie bewahre ich das Öl auf?',
            answer:
              'Vor Licht und Wärme geschützt, mit gut verschlossenem Deckel. Öl ist in den Monaten nach dem Mahlen am besten: Deshalb steht auf dem Etikett immer das Erntejahr.',
          },
          {
            id: 'miele-cristallizzato',
            question: 'Mein Honig ist fest geworden: Ist das normal?',
            answer:
              'Ja. Die Kristallisation ist ein natürlicher Vorgang und verändert den Honig nicht; wie schnell sie eintritt, hängt von den Blüten ab, Akazienhonig zum Beispiel bleibt lange flüssig. Wenn Sie ihn flüssig mögen, erwärmen Sie das Glas im Wasserbad, ohne 40 °C zu überschreiten.',
          },
        ],
      },
      {
        id: 'tracciabilita',
        label: 'Rückverfolgbarkeit',
        items: [
          {
            id: 'leggere-lotto',
            question: 'Wo finde ich die Chargennummer?',
            answer:
              'Auf dem Etikett, mit vorangestelltem L, neben dem Mindesthaltbarkeitsdatum. Sie bezeichnet die Charge: Über diese Nummer verfolgen wir Ernte, Verarbeitung und Analysen zurück.',
          },
          {
            id: 'analisi',
            question: 'Kann ich die Analysen sehen?',
            answer:
              'Wir lassen Öl und Honig jedes Jahr analysieren. Mit der Chargensuche, die in Vorbereitung ist, können Sie die Berichte des Jahrgangs herunterladen; bis dahin senden wir sie Ihnen auf Anfrage.',
          },
        ],
      },
    ],
  },

  productUi: {
    formatLabel: 'Größe',
    taxIncluded: 'inkl. MwSt.',
    loading: 'Preise und Verfügbarkeit werden geladen…',
    loadError:
      'Preise und Verfügbarkeit sind gerade nicht erreichbar. Versuchen Sie es später erneut oder schreiben Sie uns an info@le-quote.it.',
    available: 'Verfügbar',
    lowStock: (count) => (count === 1 ? 'Nur noch ein Stück' : `Nur noch ${count} Stück`),
    soldOut: 'Derzeit ausverkauft',
    notOnSale: 'Noch nicht im Verkauf',
    detailsTitle: 'Auf einen Blick',
    nutritionTitle: 'Nährwertdeklaration',
    nutritionNutrient: 'Durchschnittswerte',
    traceTitle: 'Woher es kommt',
    traceBody:
      'Die Chargennummer steht auf dem Etikett: Geben Sie sie im Bereich Herkunft ein, um Ernte, Verarbeitung und Analysen Ihrer Flasche oder Ihres Glases zu sehen.',
    traceLink: 'Zur Herkunft',
    backToShop: 'Zurück zum Shop',
  },

  products: {
    'olio-extravergine': {
      line: 'olio',
      illustration: 'oil',
      eyebrow: 'Natives Olivenöl extra',
      name: 'Natives Olivenöl extra',
      summary: 'Die Cuvée des Reservats Borsacchio: Moraiolo, Leccino und Pendolino, nur aus unseren eigenen Hainen.',
      metaDescription:
        'Natives Olivenöl extra von Le Quote: Oliven aus unseren Hainen im Reservat Borsacchio, Roseto degli Abruzzi. Flasche 750 ml und Kanister 5 Liter.',
      paragraphs: [
        'Die Oliven stammen nur aus unseren eigenen Hainen im Reservat Borsacchio, wenige Schritte vom Meer, einige mit jahrhundertealten Bäumen. Wir kaufen keine Oliven von anderen Erzeugern.',
        'Wir ernten von Hand oder mit leichten Erntehilfen, im richtigen Reifegrad, und bringen die Oliven innerhalb weniger Stunden zur Ölmühle. Die Ölmühle wechselt von Jahr zu Jahr: Für jede Charge geben wir an, welche.',
        'Jede Saison wird das Öl im Labor analysiert. Die Berichte des Jahrgangs lassen sich je Charge im Bereich Herkunft abrufen.',
      ],
      facts: [
        { label: 'Sorten', value: 'Moraiolo, Leccino, Pendolino' },
        { label: 'Haine', value: 'Reservat Borsacchio, Roseto degli Abruzzi (TE)' },
        { label: 'Ernte', value: 'Oktober und November, von Hand oder mit Erntehilfen' },
        { label: 'Gewinnung', value: 'Ausschließlich mechanisch, wenige Stunden nach der Ernte' },
      ],
      nutrition: {
        per: 'je 100 ml',
        rows: [
          { label: 'Energie', value: '[kJ / kcal laut Analyse]' },
          { label: 'Fett', value: '[g laut Analyse]' },
          { label: 'davon gesättigte Fettsäuren', value: '[g laut Analyse]' },
          { label: 'Kohlenhydrate', value: '[g laut Analyse]' },
          { label: 'davon Zucker', value: '[g laut Analyse]' },
          { label: 'Eiweiß', value: '[g laut Analyse]' },
          { label: 'Salz', value: '[g laut Analyse]' },
        ],
      },
      variantLabels: { 'OLIO-750ML': 'Flasche 750 ml', 'OLIO-5L': 'Kanister 5 L' },
    },
    miele: {
      line: 'miele',
      illustration: 'honey',
      eyebrow: 'Honig',
      name: 'Honig aus der Höhe',
      summary: 'Von den Bienenstöcken auf den Höhen von Cerchio, kalt geschleudert. Akazie, Blüte oder Honigtau, je nach Jahrgang.',
      metaDescription: 'Honig von Le Quote von den Bienenstöcken auf den Höhen von Cerchio (AQ), kalt geschleudert. Gläser zu 250 g und 500 g.',
      paragraphs: [
        'Alle unsere Bienenvölker stehen auf den Höhen von Cerchio im Hinterland von L’Aquila und folgen den wilden Blüten der Bergwiesen und -wälder.',
        'Wir gewinnen den Honig kalt, ohne ihn zu erwärmen. Eine Sortenbezeichnung wie Akazie geben wir nur an, wenn die Analysen des Jahrgangs sie bestätigen; sonst ist es Blütenhonig.',
        'Mit der Zeit kann Honig kristallisieren: Das ist ein natürlicher Vorgang. Wenn Sie ihn flüssig mögen, erwärmen Sie das Glas im Wasserbad, ohne 40 °C zu überschreiten.',
      ],
      facts: [
        { label: 'Bienenstände', value: 'Cerchio (AQ), in der Höhe' },
        { label: 'Blüten', value: 'Wild, von Mai bis September' },
        { label: 'Schleudern', value: 'Kalt, nach jeder Ernte' },
        { label: 'Aufbewahrung', value: 'Kühl und trocken, vor Licht geschützt' },
      ],
      nutrition: null,
      variantLabels: { 'MIELE-250G': 'Glas 250 g', 'MIELE-500G': 'Glas 500 g' },
    },
  },

  footer: {
    tagline: 'LE QUOTE: Olivenöl und Honig, vom Meer bis in die Berge.',
    legal: '© 2026 Le Quote, Azienda Agricola. USt-IdNr. [noch einzutragen].',
    social: [
      { label: 'Instagram', href: '#' },
      { label: 'Facebook', href: '#' },
    ],
  },

  cartUi: {
    navText: 'Warenkorb',
    navLabel: (count: number) => (count === 0 ? 'Warenkorb, leer' : `Warenkorb, ${count} Artikel`),
    addToCart: 'In den Warenkorb',
    addShort: 'Hinzufügen',
    adding: 'Wird hinzugefügt…',
    added: 'Zum Warenkorb hinzugefügt.',
    goToCart: 'Zum Warenkorb',
    addError: 'Das Produkt konnte nicht hinzugefügt werden. Bitte versuchen Sie es gleich noch einmal.',
    updateError: 'Der Warenkorb konnte nicht aktualisiert werden. Bitte versuchen Sie es gleich noch einmal.',
    quantityLabel: 'Menge',
    decrease: (item: string) => `Menge verringern: ${item}`,
    increase: (item: string) => `Menge erhöhen: ${item}`,
    title: 'Ihr Warenkorb',
    metaDescription: 'Warenkorb und Bestellung bei Le Quote: natives Olivenöl extra und Honig, Abholung auf dem Hof.',
    loading: 'Warenkorb wird geladen…',
    empty: 'Ihr Warenkorb ist leer.',
    emptyLink: 'Produkte auswählen',
    remove: 'Entfernen',
    itemsTitle: 'Produkte',
    subtotal: 'Produkte',
    shipping: 'Lieferung',
    shippingFree: 'Kostenlos',
    shippingTbd: 'Noch zu wählen',
    total: 'Gesamt',
    taxIncluded: (amount: string) => `inkl. MwSt. (${amount})`,
    continueShopping: 'Weiter einkaufen',
  },

  checkoutUi: {
    contactTitle: 'Ihre Angaben',
    firstName: 'Vorname',
    lastName: 'Nachname',
    email: 'E-Mail',
    emailHelp: 'Hierhin schicken wir die Bestätigung Ihrer Bestellung.',
    phone: 'Telefon',
    phoneHelp: 'Um Abholung oder Lieferung abzustimmen.',
    deliveryTitle: 'Wie Sie es erhalten',
    deliveryLoading: 'Lieferoptionen werden geladen…',
    pickupLabel: (city: string) => `Abholung in ${city}`,
    pickupNote: 'Kostenlos. Wir schreiben Ihnen, sobald alles bereit ist. Öffnungszeiten: [noch zu bestätigen].',
    deliveryNote: 'Versand in ganz Italien.',
    noDelivery: 'Der Versand ist noch nicht aktiv: Bestellungen werden vorerst auf dem Hof abgeholt.',
    addressTitle: 'Lieferadresse',
    address: 'Straße und Hausnummer',
    postalCode: 'PLZ',
    city: 'Ort',
    province: 'Provinz (Kürzel)',
    paymentTitle: 'Wie Sie bezahlen',
    paymentOptions: {
      bonifico: {
        label: 'Banküberweisung',
        note: 'Die Bankverbindung finden Sie auf der Bestätigungsseite. Wir bereiten die Bestellung vor, sobald die Zahlung eingegangen ist.',
      },
      ritiro: {
        label: 'Bei Abholung',
        note: 'Sie bezahlen auf dem Hof bei der Abholung: [bar und/oder Karte, noch zu bestätigen].',
      },
    },
    pickupOnly: 'Nur bei Abholung auf dem Hof.',
    termsBefore: 'Ich habe die ',
    termsLink: 'Verkaufsbedingungen',
    termsMiddle: ' gelesen und akzeptiere sie. Ich habe die ',
    privacyLink: 'Datenschutzerklärung',
    termsAfter: ' gelesen.',
    withdrawalNote:
      'Sie können binnen 14 Tagen ab Erhalt oder Abholung der Produkte ohne Angabe von Gründen widerrufen, außer bei versiegelten Packungen, die nach der Lieferung geöffnet wurden. ',
    withdrawalLink: 'So widerrufen Sie',
    submit: 'Zahlungspflichtig bestellen',
    submitting: 'Bestellung wird gesendet…',
    errorSummary: 'Bitte prüfen Sie die markierten Felder.',
    errors: {
      required: 'Pflichtfeld.',
      email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      postalCode: 'Die PLZ hat 5 Ziffern.',
      province: 'Bitte geben Sie das Provinzkürzel ein, zum Beispiel TE.',
      delivery: 'Bitte wählen Sie, wie Sie die Bestellung erhalten.',
      payment: 'Bitte wählen Sie eine Zahlungsart.',
      terms: 'Um zu bestellen, akzeptieren Sie bitte die Verkaufsbedingungen.',
      submit:
        'Die Bestellung ist fehlgeschlagen, es wurde nichts belastet. Bitte versuchen Sie es erneut oder schreiben Sie an info@le-quote.it.',
    },
  },

  orderUi: {
    title: 'Bestellung eingegangen',
    metaDescription: 'Bestellbestätigung bei Le Quote.',
    number: (id: number) => `Bestellung Nr. ${id}`,
    body: (email: string) => `Vielen Dank. Wir schreiben Ihnen an ${email}, sobald Ihre Bestellung bereit ist.`,
    loading: 'Bestellung wird geladen…',
    missing: 'Es gibt keine Bestellung anzuzeigen.',
    error:
      'Die Bestellung kann gerade nicht angezeigt werden. Wenn Sie eben bestellt haben, ist sie erfasst: Wir melden uns. Fragen: info@le-quote.it.',
    bankTitle: 'Bankverbindung für die Überweisung',
    bankHolder: 'Kontoinhaber',
    bankIban: 'IBAN',
    bankReason: 'Verwendungszweck',
    bankReasonValue: (id: number) => `Ordine ${id} Le Quote`,
    bankAmount: 'Betrag',
    bankNote: 'Wir bereiten die Bestellung vor, sobald die Überweisung eingegangen ist.',
    pickupPaymentTitle: 'Zahlung bei Abholung',
    pickupPaymentBody: 'Sie bezahlen auf dem Hof bei der Abholung: [bar und/oder Karte, noch zu bestätigen].',
    deliveryLabel: 'Lieferung',
    summaryTitle: 'Übersicht',
    backHome: 'Zur Startseite',
  },

  lotUi: {
    metaTitle: (code: string) => `Charge ${code} | Le Quote`,
    metaDescription: 'Der Weg einer Charge von Le Quote: Erntejahr, Verarbeitungsschritte, Analysen und Pflichtangaben.',
    eyebrow: 'Rückverfolgbarkeit der Charge',
    lineName: { olio: 'Natives Olivenöl extra', miele: 'Honig' },
    campaign: (label: string) => `Erntejahr ${label}`,
    stagesTitle: 'Der Weg',
    noStages: 'Die Schritte dieser Charge sind noch nicht beschrieben.',
    analysesTitle: 'Analysen',
    openAnalysis: 'Bericht öffnen',
    legalLabel: 'Pflichtangaben',
    sourceNote: 'Angaben zu den Schritten und Pflichtangaben erfasst der Hof auf Italienisch.',
    loading: 'Charge wird geladen…',
    notFoundTitle: 'Charge nicht gefunden',
    notFoundBody: (code: string) =>
      `Es gibt keine veröffentlichte Charge mit der Nummer ${code}. Prüfen Sie die Nummer auf dem Etikett oder schreiben Sie an info@le-quote.it.`,
    invalidBody: 'Diese Adresse enthält keine gültige Chargennummer.',
    error: 'Die Charge kann gerade nicht angezeigt werden. Bitte versuchen Sie es gleich noch einmal oder schreiben Sie an info@le-quote.it.',
    searchAgain: 'Andere Charge suchen',
    backHome: 'Zur Startseite',
  },
}
