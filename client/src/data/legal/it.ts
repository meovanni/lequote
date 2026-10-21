import { BANK_TRANSFER_DAYS, SELLER } from '@/data/business'
import type { LegalContent } from './types'

// Testo di riferimento delle pagine legali. Bozza con fonti, da validare con il consulente dei
// titolari prima della messa online (PRODUCT.md, "Legal Commitments"). Le traduzioni seguono
// questo file sezione per sezione.

const seller = `${SELLER.name}, ${SELLER.address}, P.IVA ${SELLER.vat}`
const contacts = `email ${SELLER.email}, PEC ${SELLER.pec}, telefono ${SELLER.phone}`

export const legalIt: LegalContent = {
  ui: {
    draftNotice:
      'Bozza in attesa di validazione da parte del consulente dell’azienda. I dati tra parentesi quadre non sono ancora stati forniti.',
    updated: (date) => `Ultimo aggiornamento: ${date}`,
    sourcesLabel: 'Riferimenti',
    tocLabel: 'In questa pagina',
    footerNavLabel: 'Informazioni legali',
    linkLabels: {
      'condizioni-di-vendita': 'Condizioni di vendita',
      recesso: 'Recesso',
      privacy: 'Privacy',
      cookie: 'Cookie',
    },
  },

  withdrawalForm: {
    openButton: 'Recedere dal contratto qui',
    confirmButton: 'Conferma recesso',
    intro: 'Compila i dati qui sotto e premi “Conferma recesso”. Ti mandiamo subito per email la ricevuta con il contenuto della dichiarazione, la data e l’ora di invio.',
    name: 'Nome e cognome',
    email: 'Email',
    emailHelp: 'Qui ricevi la ricevuta del recesso.',
    order: 'Numero dell’ordine',
    orderHelp: 'Lo trovi nell’email di conferma, per esempio “Ordine n. 12”.',
    details: 'Prodotti da restituire o note (facoltativo)',
    detailsHelp: 'Lascia vuoto se recedi dall’intero ordine.',
    required: 'Campo obbligatorio.',
    invalidEmail: 'Indirizzo email non valido.',
    sending: 'Invio in corso…',
    doneTitle: 'Recesso inviato',
    doneBody: (email, sentAt) => `Abbiamo ricevuto la tua dichiarazione di recesso il ${sentAt}. La ricevuta è in arrivo a ${email}: se non la trovi, controlla la posta indesiderata.`,
    error: 'L’invio non è riuscito. Riprova, oppure manda la dichiarazione per email a info@lequote.it: vale comunque, purché parta entro i 14 giorni.',
    tooMany: 'Troppi invii da questa connessione. Riprova tra un’ora, oppure scrivici a info@lequote.it.',
  },

  documents: {
    'condizioni-di-vendita': {
      title: 'Condizioni di vendita',
      metaDescription: 'Condizioni generali di vendita online di olio extravergine e miele Le Quote.',
      intro:
        'Queste condizioni valgono per gli acquisti fatti su questo sito da consumatori, cioè da persone che comprano per scopi estranei a un’attività professionale.',
      sections: [
        {
          id: 'venditore',
          heading: 'Chi vende',
          body: [`Il venditore è ${seller}. Contatti: ${contacts}.`],
          sources: ['D.Lgs. 206/2005 (Codice del Consumo), art. 49 c.1 lett. b-c', 'D.Lgs. 70/2003, art. 7'],
        },
        {
          id: 'prodotti-prezzi',
          heading: 'Prodotti e prezzi',
          body: [
            'Ogni scheda prodotto riporta le caratteristiche essenziali e le informazioni obbligatorie sugli alimenti, raggiungibili prima dell’acquisto nel pannello “Informazioni di legge”.',
            'I prezzi sono in euro, IVA inclusa. Le eventuali spese di consegna sono indicate nel carrello prima della conferma dell’ordine; il ritiro in azienda è gratuito.',
          ],
          sources: ['Codice del Consumo, art. 49 c.1 lett. a, e', 'Reg. (UE) 1169/2011, art. 14'],
        },
        {
          id: 'ordine',
          heading: 'Come si conclude il contratto',
          body: [
            'Scelti i prodotti, nel carrello indichi i tuoi dati, il modo di consegna e il metodo di pagamento, accetti queste condizioni e confermi con il pulsante “Ordina con obbligo di pagamento”.',
            'Il contratto si conclude quando ricevi la nostra email di conferma, che riepiloga l’ordine e contiene queste condizioni o il collegamento a esse. Il contratto è in italiano; le traduzioni del sito servono alla comprensione.',
            'Se un prodotto risulta non disponibile dopo l’ordine, ti avvisiamo e ti rimborsiamo senza ritardo quanto eventualmente già pagato.',
          ],
          sources: ['Codice del Consumo, artt. 51 c.2 e 7, 61 c.5', 'D.Lgs. 70/2003, artt. 12-13'],
        },
        {
          id: 'pagamento',
          heading: 'Pagamento',
          body: [
            'Puoi pagare in due modi:',
            {
              list: [
                `Bonifico bancario anticipato: le coordinate sono nella pagina di conferma e nell’email d’ordine. Prepariamo l’ordine quando il bonifico risulta accreditato; se non arriva entro ${BANK_TRANSFER_DAYS} giorni dall’ordine, l’ordine si annulla e te lo comunichiamo.`,
                'Pagamento al ritiro, solo se scegli il ritiro in azienda: paghi quando ritiri, con i mezzi indicati nel carrello.',
              ],
            },
            'Non raccogliamo né conserviamo dati di carte di pagamento.',
          ],
          sources: ['Codice del Consumo, art. 49 c.1 lett. g'],
        },
        {
          id: 'consegna',
          heading: 'Consegna e ritiro',
          body: [
            'Consegniamo solo in Italia. Le opzioni attive (ritiro nelle nostre sedi, spedizione) e i relativi costi sono quelli mostrati nel carrello.',
            'Per il ritiro ti scriviamo quando l’ordine è pronto, con orari e indirizzo. Per la spedizione consegniamo entro 30 giorni dall’ordine, salvo un termine diverso indicato al momento dell’acquisto.',
            'Il rischio di perdita o danneggiamento dei prodotti passa a te quando li ricevi o li ritiri.',
          ],
          sources: ['Codice del Consumo, artt. 61 e 63'],
        },
        {
          id: 'recesso',
          heading: 'Diritto di recesso',
          body: [
            'Hai 14 giorni per recedere dal contratto senza indicarne il motivo, a partire dal giorno in cui ricevi o ritiri i prodotti. Il recesso non vale per le confezioni sigillate che hai aperto dopo la consegna, perché per ragioni igieniche e di tutela della salute non possono essere rivendute.',
            'Tempi, modi, costi della restituzione e rimborso sono descritti nella pagina Recesso, che contiene anche il modulo tipo.',
          ],
          sources: ['Codice del Consumo, artt. 49 c.1 lett. h, 52, 59 c.1 lett. e'],
        },
        {
          id: 'garanzia',
          heading: 'Garanzia legale di conformità',
          body: [
            'Rispondiamo di qualsiasi difetto di conformità dei prodotti che si manifesti entro due anni dalla consegna. Per gli alimenti vale anche il termine minimo di conservazione indicato in etichetta, se conservati come indicato.',
            `In caso di difetto scrivici a ${SELLER.email}: secondo i casi sostituiamo il prodotto oppure riduciamo il prezzo o ti rimborsiamo, senza spese per te.`,
          ],
          sources: ['Codice del Consumo, artt. 128 e seguenti'],
        },
        {
          id: 'reclami',
          heading: 'Reclami e risoluzione delle controversie',
          body: [
            `Per reclami scrivici a ${SELLER.email} o via PEC a ${SELLER.pec}: rispondiamo entro [10, da confermare] giorni lavorativi.`,
            'Puoi anche rivolgerti a un organismo di risoluzione alternativa delle controversie (ADR) iscritto negli elenchi previsti dal Codice del Consumo. La piattaforma europea ODR è stata chiusa il 20 luglio 2025.',
          ],
          sources: ['Codice del Consumo, artt. 141 e seguenti', 'Reg. (UE) 2024/3228'],
        },
        {
          id: 'legge-foro',
          heading: 'Legge applicabile e foro',
          body: [
            'Il contratto è regolato dalla legge italiana, ferme restando le norme più favorevoli del Paese in cui risiedi che non si possono derogare per contratto. Per le controversie è competente il giudice del luogo in cui risiedi o hai domicilio.',
          ],
          sources: ['Reg. (CE) 593/2008 (Roma I), art. 6', 'Codice del Consumo, art. 66-bis'],
        },
      ],
    },

    recesso: {
      title: 'Diritto di recesso',
      metaDescription: 'Come recedere da un acquisto fatto su Le Quote: termini, modulo tipo, restituzione e rimborso.',
      sections: [
        {
          id: 'termine',
          heading: 'Entro quando',
          body: [
            'Puoi recedere entro 14 giorni dal giorno in cui tu, o una persona che hai indicato diversa dal corriere, ricevi o ritiri i prodotti. Se l’ordine arriva in più consegne, i 14 giorni partono dall’ultima.',
          ],
          sources: ['Codice del Consumo, art. 52 c.1 e c.2 lett. b'],
        },
        {
          id: 'esclusioni',
          heading: 'Quando il recesso non si applica',
          body: [
            'Olio e miele sono venduti in confezioni sigillate. Se una confezione è stata aperta dopo la consegna, per ragioni igieniche e di tutela della salute non può essere restituita. Puoi comunque recedere per le confezioni ancora chiuse dello stesso ordine.',
          ],
          sources: ['Codice del Consumo, art. 59 c.1 lett. e'],
        },
        {
          id: 'come',
          heading: 'Come comunicarlo',
          body: [
            `Il modo più semplice è il pulsante “Recedere dal contratto qui” in cima a questa pagina: ricevi subito la ricevuta per email. In alternativa inviaci una dichiarazione chiara prima della scadenza: per email a ${SELLER.email}, via PEC a ${SELLER.pec} o per lettera a ${SELLER.address}. Puoi usare il modulo tipo qui sotto, ma non è obbligatorio. Ti confermiamo la ricezione senza ritardo.`,
            'Basta che la comunicazione parta entro i 14 giorni.',
          ],
          sources: ['Codice del Consumo, artt. 54 e 54-bis (D.Lgs. 209/2025)'],
        },
        {
          id: 'restituzione',
          heading: 'Restituzione dei prodotti',
          body: [
            'Restituisci i prodotti entro 14 giorni dalla comunicazione del recesso, spedendoli o riportandoli in una delle nostre sedi. Le spese dirette di restituzione sono a tuo carico.',
            'Rispondi solo della diminuzione di valore dovuta a una manipolazione dei prodotti diversa da quella necessaria per verificarne natura e caratteristiche.',
          ],
          sources: ['Codice del Consumo, artt. 57 c.1-2'],
        },
        {
          id: 'rimborso',
          heading: 'Rimborso',
          body: [
            'Ti rimborsiamo entro 14 giorni dal giorno in cui riceviamo la comunicazione del recesso tutto quanto hai pagato, comprese le spese di consegna standard. Possiamo attendere di ricevere i prodotti, o la prova della spedizione, prima di rimborsarti.',
            'Rimborsiamo con lo stesso mezzo che hai usato per pagare. Se hai pagato in contanti al ritiro, rimborsiamo con bonifico sul conto che ci indichi, senza costi per te.',
          ],
          sources: ['Codice del Consumo, art. 56'],
        },
        {
          id: 'modulo',
          heading: 'Modulo tipo di recesso',
          body: [
            'Compila e restituisci il modulo solo se vuoi recedere dal contratto.',
            {
              list: [
                `Destinatario: ${seller}, ${SELLER.email}, PEC ${SELLER.pec}.`,
                'Con la presente io/noi (*) notifichiamo il recesso dal mio/nostro (*) contratto di vendita dei seguenti beni: …',
                'Ordinato il (*) / ricevuto il (*): …',
                'Numero dell’ordine: …',
                'Nome del/dei consumatore/i: …',
                'Indirizzo del/dei consumatore/i: …',
                'Firma del/dei consumatore/i (solo se il modulo è inviato su carta): …',
                'Data: …',
              ],
            },
            '(*) Cancellare la dicitura inutile.',
          ],
          sources: ['Codice del Consumo, Allegato I, parte B'],
        },
      ],
    },

    privacy: {
      title: 'Informativa sulla privacy',
      metaDescription: 'Come Le Quote tratta i dati personali di chi visita il sito e di chi ordina.',
      intro: 'Trattiamo solo i dati che servono a gestire gli ordini e a rispondere a chi ci scrive. Non facciamo marketing né profilazione.',
      sections: [
        {
          id: 'titolare',
          heading: 'Titolare del trattamento',
          body: [`${seller}. Per qualsiasi richiesta sui tuoi dati: ${SELLER.email}.`],
          sources: ['Reg. (UE) 2016/679 (GDPR), art. 13 c.1 lett. a'],
        },
        {
          id: 'dati-finalita',
          heading: 'Quali dati, perché e su quale base',
          body: [
            {
              list: [
                'Ordini: nome, email, telefono, indirizzo di consegna se scegli la spedizione, prodotti e importi. Servono a concludere ed eseguire il contratto e a contattarti per la consegna o il ritiro (base: esecuzione del contratto).',
                'Obblighi fiscali e contabili: i dati dell’ordine e del pagamento che la legge ci impone di registrare e conservare (base: obbligo di legge).',
                'Messaggi: se ci scrivi, usiamo i dati che ci dai per risponderti (base: misure richieste da te o nostro legittimo interesse a rispondere).',
                'Sicurezza: il server registra dati tecnici delle richieste, come l’indirizzo IP, per proteggere il sito da abusi (base: legittimo interesse alla sicurezza).',
              ],
            },
            'I dati degli ordini sono necessari: senza, non possiamo accettare l’ordine. La ricerca di un lotto e la consultazione del sito non richiedono dati personali.',
          ],
          sources: ['GDPR, art. 6 c.1 lett. b, c, f', 'GDPR, art. 13 c.1 lett. c-d, c.2 lett. e'],
        },
        {
          id: 'destinatari',
          heading: 'Chi riceve i dati',
          body: [
            'I dati sono trattati da noi e, per nostro conto e con un contratto che li vincola, da:',
            {
              list: [
                'il fornitore del server che ospita sito e gestionale: [da indicare dopo la scelta, Fase 4];',
                'il fornitore della casella di posta da cui inviamo le email d’ordine: [da indicare];',
                'il nostro commercialista, per gli adempimenti fiscali;',
                'il corriere, solo per gli ordini spediti: [da indicare quando la spedizione sarà attiva].',
              ],
            },
            'La banca riceve i dati del bonifico che effettui. Non vendiamo né cediamo i dati a terzi per altri scopi.',
          ],
          sources: ['GDPR, artt. 13 c.1 lett. e, 28'],
        },
        {
          id: 'trasferimenti',
          heading: 'Dove sono i dati',
          body: ['Sito e gestionale sono ospitati su un server nell’Unione europea [da confermare con la scelta dell’hosting]. Non trasferiamo dati fuori dallo Spazio economico europeo.'],
          sources: ['GDPR, art. 13 c.1 lett. f'],
        },
        {
          id: 'conservazione',
          heading: 'Per quanto tempo',
          body: [
            {
              list: [
                'Dati degli ordini e documenti contabili: 10 anni, come prevede la legge.',
                'Carrelli non trasformati in ordine: 5 giorni dall’ultima modifica, poi vengono cancellati.',
                'Messaggi: il tempo necessario a gestire la richiesta, poi al massimo [12 mesi, da confermare].',
                'Registri tecnici del server: [14 giorni, da confermare].',
              ],
            },
          ],
          sources: ['GDPR, art. 13 c.2 lett. a', 'Codice civile, art. 2220'],
        },
        {
          id: 'diritti',
          heading: 'I tuoi diritti',
          body: [
            `Puoi chiederci in ogni momento l’accesso ai tuoi dati, la rettifica, la cancellazione, la limitazione del trattamento, la portabilità, e opporti ai trattamenti basati sul legittimo interesse, scrivendo a ${SELLER.email}. Rispondiamo entro un mese.`,
            'Se ritieni che il trattamento violi la normativa puoi proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).',
            'Non prendiamo decisioni basate unicamente su trattamenti automatizzati.',
          ],
          sources: ['GDPR, artt. 12, 15-22, 77'],
        },
      ],
    },

    cookie: {
      title: 'Cookie e memoria del browser',
      metaDescription: 'Quali dati il sito Le Quote salva nel browser: solo quelli tecnici, niente profilazione.',
      intro: 'Il sito non usa cookie di profilazione né strumenti di statistica, e non carica contenuti da altri siti. Per questo non ti chiediamo alcun consenso.',
      sections: [
        {
          id: 'tecnici',
          heading: 'Cosa salviamo nel browser',
          body: [
            {
              list: [
                '“lequote.cart” (memoria locale del browser): il codice del tuo carrello, così ritrovi i prodotti se torni sul sito. Non contiene dati personali e si cancella quando l’ordine è concluso; puoi eliminarlo anche dalle impostazioni del browser.',
                'Area riservata: solo per chi gestisce il negozio, un cookie di sessione tiene aperto l’accesso al gestionale e si cancella all’uscita.',
              ],
            },
            'Sono strumenti tecnici, necessari a fornire il servizio che chiedi: per legge non richiedono consenso.',
          ],
          sources: [
            'D.Lgs. 196/2003 (Codice privacy), art. 122 c.1',
            'Garante privacy, Linee guida cookie e altri strumenti di tracciamento, 10 giugno 2021',
          ],
        },
        {
          id: 'terze-parti',
          heading: 'Contenuti di terze parti',
          body: [
            'Caratteri tipografici, immagini e video sono serviti dal nostro server: visitando il sito non invii dati a Google, ai social network o ad altri fornitori. Se in futuro aggiungeremo strumenti di terze parti, aggiorneremo questa pagina e, dove serve, ti chiederemo il consenso prima di attivarli.',
          ],
        },
      ],
    },
  },
}
