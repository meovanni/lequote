import type { Content } from './it'

// English translation of it.ts. Same ids and structure; the Italian file is the reference and
// the legal references stay as published in Italian law.
export const en: Content = {
  meta: {
    title: 'Le Quote | Olive oil and honey from the Borsacchio to the Apennines',
    description:
      'Le Quote, a family farm between the Borsacchio Nature Reserve and Cerchio (AQ): extra virgin olive oil and honey, from the sea to the Abruzzo mountains.',
  },

  ui: {
    skipLink: 'Skip to content',
    menuOpen: 'Open the menu',
    menuClose: 'Close the menu',
    mainNavLabel: 'Main menu',
    footerNavLabel: 'Footer menu',
    languageLabel: 'Language',
    languageNames: { it: 'Italiano', en: 'English', de: 'Deutsch' },
    filieraTablistLabel: 'Product line',
    seasonActive: 'Now',
    periodRange: (from, to) => `${from} to ${to}`,
    oilBottleLabel: 'A 750 ml bottle of Le Quote extra virgin olive oil',
    honeyJarLabel: 'A jar of Le Quote honey',
    notFoundTitle: 'Page not found',
    notFoundBody: 'This address does not match any page on the site.',
    errorTitle: 'Something went wrong',
    errorBody: 'Reload the page; if the problem persists, write to us at info@le-quote.it.',
    backHome: 'Back to the home page',
    adminLink: 'Staff area',
  },

  navItems: [
    { id: 'territorio', label: 'Land' },
    { id: 'olio', label: 'Oil' },
    { id: 'miele', label: 'Honey' },
    { id: 'filiera', label: 'Supply chain' },
    { id: 'stagioni', label: 'Seasons' },
    { id: 'shop', label: 'Shop' },
  ],

  footerNavItems: [
    { id: 'chi-siamo', label: 'About us' },
    { id: 'territorio', label: 'Land' },
    { id: 'olio', label: 'Oil' },
    { id: 'miele', label: 'Honey' },
    { id: 'filiera', label: 'Supply chain' },
    { id: 'stagioni', label: 'Seasons' },
    { id: 'shop', label: 'Shop' },
    { id: 'domande', label: 'FAQ' },
    { id: 'contatti', label: 'Contact' },
  ],

  hero: {
    eyebrow: 'Family farm, Abruzzo',
    title: 'Le Quote',
    subtitle: 'From sea level to the heights of the Abruzzo Apennines.',
    body: 'A family farm split between two very different places: the Borsacchio Nature Reserve, on the coast at Roseto degli Abruzzi, and the uplands of Cerchio, inland from L’Aquila. This is where our extra virgin olive oil and our honey come from.',
    poster: '/images/oliveto.jpg',
    posterAlt: 'The avenue of olive trees in the Borsacchio Reserve',
    ctaPrimary: { label: 'Explore the land', href: '#territorio' },
    ctaSecondary: { label: 'Discover the products ↓', href: '#olio' },
  },

  chiSiamo: {
    eyebrow: 'About us',
    title: 'One family, two landscapes',
    paragraphs: [
      'Le Quote began with a simple choice: to stay true to the land, whatever its altitude. On one side the salty wind of the Adriatic coast, on the other the thin air of the Apennine heights: two landscapes that seem opposite and that, for us, are the same home.',
      'On the coast we grow olive trees, in the mountains we look after our beehives, following the rhythm of the seasons. No shortcuts: only the time it takes for a fruit or a honeycomb to ripen as it should.',
      'The name Le Quote, “the altitudes”, says exactly this: the farm lives at different heights, from sea level up to eight hundred metres, and the variety of our products comes from that distance.',
    ],
    imageLabel: 'Photo: Daily work among olive groves and beehives',
  },

  territorio: {
    eyebrow: 'Land',
    title: 'Two altitudes, one land',
    intro: 'Eight hundred metres of height separate our two sites. Enough to tell the story of two worlds.',
    imageOliveto: '/images/oliveto.jpg',
    imageOlivetoLabel: 'Photo: The avenue of olive trees in the Borsacchio Reserve',
    imageApiario: '/images/arnie.jpg',
    imageApiarioLabel: 'Photo: The beehives on the heights of Cerchio',
    markers: [
      {
        id: 'roseto',
        place: 'Roseto degli Abruzzi',
        note: 'The Borsacchio Reserve, between Mediterranean scrub and olive groves a few steps from the sea.',
      },
      {
        id: 'cerchio',
        place: 'Cerchio',
        note: 'The uplands inland from L’Aquila, where the bees gather mountain honeys.',
      },
    ],
  },

  olio: {
    eyebrow: 'Extra virgin olive oil',
    title: 'The oil of the reserve',
    elevation: 'Sea level',
    body: 'We use only olives from our own groves, some with centuries-old trees. We pick them by hand or with light harvesting aids, at the right ripeness, and take them to the mill within a few hours. Every season the oil is tested in a laboratory.',
    varieties: [
      { name: 'Moraiolo', note: 'traditional cultivar of central Italy' },
      { name: 'Leccino', note: 'hardy tree, stands up well to the cold' },
      { name: 'Pendolino', note: 'pollinator for the other olive trees in the field' },
    ],
    imageLabel: 'Photo: Bottle of Le Quote extra virgin olive oil',
    imageLabelAlt: 'Photo: Bottle of Le Quote extra virgin olive oil, back',
    image: '/images/bottiglia1.png',
    imageAlt: '/images/bottiglia2.png',
  },

  miele: {
    eyebrow: 'Honey',
    title: 'Mountain honey',
    elevation: 'Mountain altitude',
    body: 'All our hives stand on the heights of Cerchio, inland from L’Aquila, and follow the wild blossoms of the upland meadows and woods. We harvest honeys that differ in colour, scent and texture, always extracted cold.',
    varieties: [
      { name: 'Acacia honey', note: 'pale and delicate, stays runny for a long time' },
      { name: 'Wildflower', note: 'changes with each season’s blossoms' },
      { name: 'Honeydew', note: 'dark, harvested at the end of summer' },
    ],
    imageLabel: 'Photo: The hives on the heights of Cerchio',
    imageLabelAlt: 'Photo: Jars of Le Quote honey',
    image: '/images/arnie.jpg',
    imageAlt: '/images/miele.png',
  },

  contatti: {
    eyebrow: 'Contact',
    title: 'Come and see us, at any altitude',
    email: 'info@le-quote.it',
    phone: '[Phone to be confirmed]',
    note: 'Write to us for visits, tastings or information about our products.',
  },

  shop: {
    eyebrow: 'Shop',
    title: 'Order online',
    intro: 'Choose products and quantities, then complete your order from the cart. Prices include VAT.',
    summaryTitle: 'In your cart',
    summaryCount: (count: number) => (count === 1 ? '1 item' : `${count} items`),
    totalLabel: 'Total',
  },

  shopCatalog: [
    {
      id: 'olio',
      handle: 'olio-extravergine',
      name: 'Extra Virgin Olive Oil',
      note: 'The blend of the reserve: Moraiolo, Leccino and Pendolino.',
      variants: [
        {
          id: 'olio-750ml',
          sku: 'OLIO-750ML',
          label: '750 ml bottle',
          imageLabel: 'Photo: 750 ml bottle of Le Quote extra virgin olive oil',
        },
        {
          id: 'olio-5l',
          sku: 'OLIO-5L',
          label: '5 L tin',
          imageLabel: 'Photo: 5 litre tin of Le Quote extra virgin olive oil',
        },
      ],
    },
    {
      id: 'miele',
      handle: 'miele',
      name: 'Honey',
      note: 'Extracted cold, to preserve its enzymes and aromas.',
      variants: [
        {
          id: 'miele-250g',
          sku: 'MIELE-250G',
          label: '250 g jar',
          imageLabel: 'Photo: 250 g jar of Le Quote honey',
        },
        {
          id: 'miele-500g',
          sku: 'MIELE-500G',
          label: '500 g jar',
          imageLabel: 'Photo: 500 g jar of Le Quote honey',
        },
      ],
    },
  ],

  filiera: {
    eyebrow: 'Supply chain',
    title: 'From the tree to your batch',
    intro:
      'Every bottle and every jar carries a batch code. Here you can follow the path each product takes, from the field to the label.',
    legalPanelLabel: 'Legal information',
    internalNote:
      'For each batch we also keep the records required by the control authorities (Reg. (EC) 178/2002, art. 18): they stay internal and are not published.',
    lines: [
      {
        line: 'olio',
        label: 'Extra virgin olive oil',
        elevation: 'Sea level',
        summary: 'Only olives from our own groves, milled by a mill chosen for each season.',
        steps: [
          {
            id: 'oliveto',
            title: 'Olive grove',
            place: 'Borsacchio Reserve, Roseto degli Abruzzi',
            period: 'All year',
            description: 'We work only our own olive trees: we do not buy olives from other growers.',
          },
          {
            id: 'raccolta',
            title: 'Harvest',
            place: 'Borsacchio',
            period: 'October, November',
            description: 'By hand or with light harvesting aids, at the right ripeness.',
          },
          {
            id: 'molitura',
            title: 'Milling',
            place: 'The season’s mill',
            period: 'Within a few hours',
            description: 'The mill changes from year to year: for each batch we state which one.',
          },
          {
            id: 'analisi',
            title: 'Testing',
            place: 'Laboratory',
            period: 'Every season',
            description: 'Chemical and sensory tests on the oil of the year.',
          },
          {
            id: 'imbottigliamento',
            title: 'Bottling',
            place: 'At the mill',
            period: 'After milling',
            description: 'Every bottle gets the batch code and the best-before date.',
          },
        ],
        legalInfo: [
          {
            label: 'Name of the food',
            value: 'Extra virgin olive oil',
            reference: 'Del. Reg. (EU) 2022/2104, art. 5',
          },
          {
            label: 'Category',
            value: 'Superior category olive oil obtained directly from olives and solely by mechanical means',
            reference: 'Del. Reg. (EU) 2022/2104, art. 5',
          },
          {
            label: 'Origin',
            value: 'Italy: olives harvested and milled in Italy',
            reference: 'Del. Reg. (EU) 2022/2104, art. 8; Law 9/2013, art. 1',
          },
          {
            label: 'Harvest season',
            value: 'Shown on the label, before the best-before date',
            reference: 'Law 9/2013, art. 7',
          },
          {
            label: 'Storage',
            value: 'Keep away from light and heat',
            reference: 'Del. Reg. (EU) 2022/2104, art. 7',
          },
          {
            label: 'Nutrition declaration',
            value: 'On the label and on the product page, per 100 ml',
            reference: 'Reg. (EU) 1169/2011, art. 30',
          },
          {
            label: 'Batch',
            value: 'Code preceded by the letter L',
            reference: 'Legislative Decree 231/2017, art. 17',
          },
          {
            label: 'Food business operator',
            value: 'Le Quote, Azienda Agricola, [address to be confirmed]',
            reference: 'Reg. (EU) 1169/2011, art. 9',
          },
          {
            label: 'Packing establishment',
            value: 'The season’s mill, shown on the label',
            reference: 'Legislative Decree 145/2017',
          },
        ],
      },
      {
        line: 'miele',
        label: 'Honey',
        elevation: 'Mountain altitude',
        summary: 'Hives on the heights of Cerchio, honey extracted cold.',
        steps: [
          {
            id: 'apiario',
            title: 'Apiary',
            place: 'Cerchio (AQ)',
            period: 'All year',
            description: 'All our hives stand on the heights of Cerchio.',
          },
          {
            id: 'fioritura',
            title: 'Blossoms',
            place: 'Upland meadows and woods',
            period: 'May to September',
            description: 'The bees forage on the season’s wild blossoms.',
          },
          {
            id: 'smielatura',
            title: 'Extraction',
            place: 'Cerchio',
            period: 'After each harvest',
            description: 'Cold extraction, without heating the honey.',
          },
          {
            id: 'analisi',
            title: 'Testing',
            place: 'Laboratory',
            period: 'Every year',
            description: 'The tests also confirm the declared floral origin.',
          },
          {
            id: 'invasettamento',
            title: 'Jarring',
            place: '[Facility to be confirmed]',
            period: 'After extraction',
            description: 'Every jar gets the batch code and the best-before date.',
          },
        ],
        legalInfo: [
          {
            label: 'Name of the food',
            value: 'Honey, with the floral origin when documented by the tests',
            reference: 'Legislative Decree 179/2004, art. 3',
          },
          {
            label: 'Origin',
            value: 'Italy',
            reference: 'Legislative Decree 179/2004, art. 3, as amended by Legislative Decree 207/2025',
          },
          {
            label: 'Best before',
            value: 'Shown on the label',
            reference: 'Reg. (EU) 1169/2011, art. 9',
          },
          {
            label: 'Nutrition declaration',
            value: 'Not required: unprocessed single-ingredient product',
            reference: 'Reg. (EU) 1169/2011, annex V',
          },
          {
            label: 'Batch',
            value: 'Code preceded by the letter L',
            reference: 'Legislative Decree 231/2017, art. 17',
          },
          {
            label: 'Food business operator',
            value: 'Le Quote, Azienda Agricola, [address to be confirmed]',
            reference: 'Reg. (EU) 1169/2011, art. 9',
          },
        ],
      },
    ],
    lookup: {
      label: 'Have a bottle or a jar? Enter the batch code',
      placeholder: 'E.g. L2026-01',
      submitLabel: 'Find the batch',
      help: 'You will find it on the label, preceded by the letter L, next to the best-before date.',
      emptyError: 'Enter the batch code printed on the label.',
      formatError: 'The code does not look right: copy it as it appears on the label (letters, numbers, dashes or dots).',
    },
  },

  stagioni: {
    eyebrow: 'Seasons',
    title: 'One year, two altitudes',
    intro: 'The calendar changes with each year: these are the usual windows for our work, by the sea and in the mountains.',
    currentMonthLabel: 'Current month',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    monthsLong: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    tracks: [
      {
        line: 'olio',
        label: 'Oil',
        place: 'Borsacchio, sea level',
        activities: [
          { id: 'potatura', label: 'Pruning', from: 2, to: 3 },
          { id: 'fioritura-olivi', label: 'Olive blossom', from: 5, to: 6 },
          { id: 'raccolta', label: 'Harvest and milling', from: 10, to: 11 },
          { id: 'imbottigliamento', label: 'Bottling', from: 11, to: 12 },
        ],
      },
      {
        line: 'miele',
        label: 'Honey',
        place: 'Cerchio, in the mountains',
        activities: [
          { id: 'ripresa', label: 'Colonies build up', from: 3, to: 4 },
          { id: 'acacia', label: 'Acacia blossom', from: 5, to: 5 },
          { id: 'millefiori', label: 'Wildflower', from: 6, to: 7 },
          { id: 'melata', label: 'Honeydew', from: 8, to: 9 },
          { id: 'invernamento', label: 'Wintering', from: 11, to: 2 },
        ],
      },
    ],
  },

  domande: {
    eyebrow: 'FAQ',
    title: 'Frequently asked questions',
    topics: [
      {
        id: 'ordini',
        label: 'Orders and delivery',
        items: [
          {
            id: 'come-ordinare',
            question: 'How can I order?',
            answer:
              'In the Shop section choose products and quantities and send the request: your email program opens with the summary. We reply to confirm availability, shipping cost and payment method. An online shop with direct payment is on its way.',
          },
          {
            id: 'dove-spedite',
            question: 'Where do you ship?',
            answer:
              'Anywhere in Italy. If you prefer, you can collect at the farm in Roseto degli Abruzzi or in Cerchio, agreeing a day and time with us.',
          },
          {
            id: 'recesso',
            question: 'Can I change my mind after buying?',
            answer:
              'Yes. For distance purchases you have 14 days from delivery to withdraw (Italian Consumer Code, art. 52): just write to us. The full terms of sale will be published with the online shop.',
          },
          {
            id: 'visite',
            question: 'Can we visit you?',
            answer: 'Yes, by appointment: write to info@le-quote.it saying which of the two sites you would like to visit.',
          },
        ],
      },
      {
        id: 'prodotti',
        label: 'Storage',
        items: [
          {
            id: 'conservare-olio',
            question: 'How should I store the oil?',
            answer:
              'Away from light and heat, with the cap tightly closed. Oil is at its best in the months after milling: that is why the label always shows the harvest season.',
          },
          {
            id: 'miele-cristallizzato',
            question: 'My honey has set solid: is that normal?',
            answer:
              'Yes. Crystallisation is a natural process and does not spoil the honey; how fast it happens depends on the flowers, and acacia for example stays runny for a long time. If you prefer it liquid, warm the jar in a water bath without going above 40 °C.',
          },
        ],
      },
      {
        id: 'tracciabilita',
        label: 'Traceability',
        items: [
          {
            id: 'leggere-lotto',
            question: 'Where do I find the batch code?',
            answer:
              'On the label, preceded by the letter L, next to the best-before date. It identifies the batch: from that code we trace back the harvest, processing and tests.',
          },
          {
            id: 'analisi',
            question: 'Can I see the test results?',
            answer:
              'We test our oil and honey every year. With the batch lookup, now in preparation, the year’s reports will be downloadable; until then we send them on request.',
          },
        ],
      },
    ],
  },

  productUi: {
    formatLabel: 'Size',
    taxIncluded: 'VAT included',
    loading: 'Loading prices and availability…',
    loadError: 'Prices and availability cannot be reached right now. Try again later or write to us at info@le-quote.it.',
    available: 'In stock',
    lowStock: (count) => (count === 1 ? 'Last one left' : `Only ${count} left`),
    soldOut: 'Sold out for now',
    notOnSale: 'Not on sale yet',
    detailsTitle: 'At a glance',
    nutritionTitle: 'Nutrition declaration',
    nutritionNutrient: 'Average values',
    traceTitle: 'Where it comes from',
    traceBody:
      'The batch code is on the label: enter it in the Supply chain section to see the harvest, processing and tests behind your bottle or jar.',
    traceLink: 'Go to the supply chain',
    backToShop: 'Back to the shop',
  },

  products: {
    'olio-extravergine': {
      line: 'olio',
      illustration: 'oil',
      eyebrow: 'Extra virgin olive oil',
      name: 'Extra virgin olive oil',
      summary: 'The blend of the Borsacchio Reserve: Moraiolo, Leccino and Pendolino, only from our own groves.',
      metaDescription:
        'Le Quote extra virgin olive oil: olives from our groves in the Borsacchio Reserve, Roseto degli Abruzzi. 750 ml bottle and 5 litre tin.',
      paragraphs: [
        'The olives come only from our own groves in the Borsacchio Reserve, a few steps from the sea, some with centuries-old trees. We do not buy olives from other growers.',
        'We pick by hand or with light harvesting aids, at the right ripeness, and take the olives to the mill within a few hours. The mill changes from year to year: for each batch we state which one.',
        'Every season the oil is tested in a laboratory. The year’s reports can be looked up by batch, in the Supply chain section.',
      ],
      facts: [
        { label: 'Cultivars', value: 'Moraiolo, Leccino, Pendolino' },
        { label: 'Groves', value: 'Borsacchio Reserve, Roseto degli Abruzzi (TE)' },
        { label: 'Harvest', value: 'October and November, by hand or with harvesting aids' },
        { label: 'Extraction', value: 'Mechanical only, within a few hours of picking' },
      ],
      nutrition: {
        per: 'per 100 ml',
        rows: [
          { label: 'Energy', value: '[kJ / kcal from tests]' },
          { label: 'Fat', value: '[g from tests]' },
          { label: 'of which saturates', value: '[g from tests]' },
          { label: 'Carbohydrate', value: '[g from tests]' },
          { label: 'of which sugars', value: '[g from tests]' },
          { label: 'Protein', value: '[g from tests]' },
          { label: 'Salt', value: '[g from tests]' },
        ],
      },
      variantLabels: { 'OLIO-750ML': '750 ml bottle', 'OLIO-5L': '5 L tin' },
    },
    miele: {
      line: 'miele',
      illustration: 'honey',
      eyebrow: 'Honey',
      name: 'Mountain honey',
      summary: 'From the hives on the heights of Cerchio, extracted cold. Acacia, wildflower or honeydew depending on the year.',
      metaDescription: 'Le Quote honey from the hives on the heights of Cerchio (AQ), extracted cold. 250 g and 500 g jars.',
      paragraphs: [
        'All our hives stand on the heights of Cerchio, inland from L’Aquila, and follow the wild blossoms of the upland meadows and woods.',
        'We extract the honey cold, without heating it. We give a floral name, such as acacia, only when the year’s tests confirm it; otherwise it is wildflower.',
        'Over time honey may crystallise: it is a natural process. If you prefer it runny, warm the jar in a water bath without going above 40 °C.',
      ],
      facts: [
        { label: 'Apiaries', value: 'Cerchio (AQ), in the mountains' },
        { label: 'Blossoms', value: 'Wild, from May to September' },
        { label: 'Extraction', value: 'Cold, after each harvest' },
        { label: 'Storage', value: 'Cool, dry place, away from light' },
      ],
      nutrition: null,
      variantLabels: { 'MIELE-250G': '250 g jar', 'MIELE-500G': '500 g jar' },
    },
  },

  footer: {
    tagline: 'LE QUOTE: Olive oil and honey, from the sea to the mountains.',
    legal: '© 2026 Le Quote, Azienda Agricola. VAT no. [to be added].',
    social: [
      { label: 'Instagram', href: '#' },
      { label: 'Facebook', href: '#' },
    ],
  },

  cartUi: {
    navText: 'Cart',
    navLabel: (count: number) => (count === 0 ? 'Cart, empty' : `Cart, ${count} ${count === 1 ? 'item' : 'items'}`),
    addToCart: 'Add to cart',
    addShort: 'Add',
    adding: 'Adding…',
    added: 'Added to cart.',
    goToCart: 'Go to cart',
    addError: 'We couldn’t add the product. Please try again shortly.',
    updateError: 'We couldn’t update the cart. Please try again shortly.',
    quantityLabel: 'Quantity',
    decrease: (item: string) => `Decrease quantity: ${item}`,
    increase: (item: string) => `Increase quantity: ${item}`,
    title: 'Your cart',
    metaDescription: 'Cart and order on the Le Quote website: extra virgin olive oil and honey, with farm pickup.',
    loading: 'Loading your cart…',
    empty: 'Your cart is empty.',
    emptyLink: 'Choose products',
    remove: 'Remove',
    itemsTitle: 'Products',
    subtotal: 'Products',
    shipping: 'Delivery',
    shippingFree: 'Free',
    shippingTbd: 'To be chosen',
    total: 'Total',
    taxIncluded: (amount: string) => `VAT included (${amount})`,
    continueShopping: 'Continue shopping',
  },

  checkoutUi: {
    contactTitle: 'Your details',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    emailHelp: 'We will write to you here to confirm the order.',
    phone: 'Phone',
    phoneHelp: 'To arrange pickup or delivery.',
    deliveryTitle: 'How you receive it',
    deliveryLoading: 'Loading delivery options…',
    pickupLabel: (city: string) => `Pickup in ${city}`,
    pickupNote: 'Free. We will write to you when it is ready. Hours: [to be confirmed].',
    deliveryNote: 'Delivery anywhere in Italy.',
    noDelivery: 'Home delivery is not active yet: for now orders are collected at the farm.',
    addressTitle: 'Delivery address',
    address: 'Street and number',
    postalCode: 'Postcode',
    city: 'Town',
    province: 'Province (code)',
    paymentTitle: 'How you pay',
    paymentOptions: {
      bonifico: {
        label: 'Bank transfer',
        note: 'You will find the bank details on the confirmation page. We prepare the order once the payment has cleared.',
      },
      ritiro: {
        label: 'On pickup',
        note: 'Pay at the farm when you collect the order: [cash and/or card, to be confirmed].',
      },
    },
    pickupOnly: 'Only with farm pickup.',
    termsBefore: 'I have read and accept the ',
    termsLink: 'terms of sale',
    termsMiddle: '. I have read the ',
    privacyLink: 'privacy notice',
    termsAfter: '.',
    withdrawalNote:
      'You may withdraw within 14 days of receiving or collecting the products, without giving a reason, except for sealed packs opened after delivery. ',
    withdrawalLink: 'How to withdraw',
    submit: 'Order with obligation to pay',
    submitting: 'Sending your order…',
    errorSummary: 'Please check the highlighted fields.',
    errors: {
      required: 'Required field.',
      email: 'Enter a valid email address.',
      postalCode: 'The postcode has 5 digits.',
      province: 'Enter the province code, for example TE.',
      delivery: 'Choose how to receive the order.',
      payment: 'Choose how to pay.',
      terms: 'To order, please accept the terms of sale.',
      submit:
        'The order did not go through and you have not been charged. Please try again, or write to info@le-quote.it.',
    },
  },

  orderUi: {
    title: 'Order received',
    metaDescription: 'Order confirmation on Le Quote.',
    number: (id: number) => `Order no. ${id}`,
    body: (email: string) => `Thank you. We will write to ${email} when your order is ready.`,
    loading: 'Loading your order…',
    missing: 'There is no order to show.',
    error:
      'We can’t show the order right now. If you have just ordered, the order is recorded and we will write to you. Questions: info@le-quote.it.',
    bankTitle: 'Bank transfer details',
    bankHolder: 'Account holder',
    bankIban: 'IBAN',
    bankReason: 'Reference',
    bankReasonValue: (id: number) => `Ordine ${id} Le Quote`,
    bankAmount: 'Amount',
    bankNote: 'We prepare the order once the transfer has cleared.',
    pickupPaymentTitle: 'Payment on pickup',
    pickupPaymentBody: 'Pay at the farm when you collect the order: [cash and/or card, to be confirmed].',
    deliveryLabel: 'Delivery',
    summaryTitle: 'Summary',
    backHome: 'Back to home',
  },

  lotUi: {
    metaTitle: (code: string) => `Batch ${code} | Le Quote`,
    metaDescription: 'The journey of a Le Quote batch: harvest season, processing stages, test results and legal information.',
    eyebrow: 'Batch traceability',
    lineName: { olio: 'Extra virgin olive oil', miele: 'Honey' },
    campaign: (label: string) => `Season ${label}`,
    stagesTitle: 'The journey',
    noStages: 'The stages of this batch have not been described yet.',
    analysesTitle: 'Test results',
    openAnalysis: 'Open the report',
    legalLabel: 'Legal information',
    sourceNote: 'Stage details and legal information are recorded by the farm in Italian.',
    loading: 'Loading the batch…',
    notFoundTitle: 'Batch not found',
    notFoundBody: (code: string) =>
      `There is no published batch with code ${code}. Check the code on the label, or write to us at info@le-quote.it.`,
    invalidBody: 'This address does not contain a valid batch code.',
    error: 'We can’t show the batch right now. Please try again shortly, or write to us at info@le-quote.it.',
    searchAgain: 'Find another batch',
    backHome: 'Back to home',
  },
}
