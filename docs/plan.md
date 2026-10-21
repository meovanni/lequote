# Piano a fasi

Decisioni: `../PRODUCT.md`, `../DESIGN.md`, `adr/`.

## Fase 1: vetrina (completata il 2026-10-11; su telefono scroll del tutto nativo dopo la prova su iPhone)
- Redesign ibrido Seed / Le Quote (DESIGN.md): titoli leggeri, pillole, niente ombre né gradienti decorativi, specimen tag mono, ritmo chiaro / bosco.
- Hero: foto poster + video MP4/WebM dove disponibile.
- Nuove sezioni con contenuti statici tipizzati come le future API: Filiera e tracciabilità (pannello "Informazioni di legge", campo lotto non ancora attivo), Calendario delle stagioni, Domande frequenti.
- Correzione dei testi non dimostrabili (acidità, descrittori organolettici, alveari solo a Cerchio).
- Test unitari e di componente (Vitest).

## Fase 2: back end e gestionale (in corso)
Medusa v2 + Postgres; moduli Filiera (ADR 0002), Etichette (ADR 0005), contenuti (calendario, FAQ, testi); catalogo, ordini, clienti, magazzino per lotto; pagamenti manuali (bonifico, al ritiro), Stripe rinviato.

Fatto (2026-10-11):
- `server/` con Medusa 2.21.2 e Postgres 17. In sviluppo Postgres gira su Windows senza Docker (`embedded-postgres`); in produzione resta in Docker.
- Dati iniziali: regione Italia con IVA inclusa (4% olio, 10% miele, da confermare con il consulente), sedi di Roseto e Cerchio con ritiro gratuito, spedizione creata disattivata in attesa di tariffa e soglia, catalogo della vetrina con giacenze a zero, pagamento manuale (Stripe si attiva con la chiave).
- Modulo Filiera: anagrafiche (oliveti, apiari, frantoi, stabilimenti), campagne con analisi annuali, modelli di fase per linea, lotti con fasi. Un lotto si pubblica solo con i dati obbligatori di etichetta; la proiezione pubblica esclude sempre i dati interni.
- API: `GET /store/filiera/lots/:codice` (pubblica) e `/admin/filiera/*` (back office).
- Back office: Filiera › Lotti, scheda lotto, Campagne, Anagrafiche (modelli di fase in sola lettura).

- Revisione del codice applicata: referti di analisi in un archivio privato (`server/private/`, da includere nei backup) serviti da rotte che ricontrollano la visibilità; operazioni sul lotto in transazione con blocco della riga; fasi ricostruite dai modelli sul server; anagrafiche in uso non eliminabili; codice, linea e campagna di un lotto pubblico non modificabili.

Da verificare con il commercialista: aliquota IVA sulle spese di spedizione (oggi l'aliquota ordinaria 22%; di norma segue quella dei beni).

Da fare: editor dei modelli di fase, contenuti (FAQ, calendario), Etichette, magazzino per lotto, distinzione bonifico / pagamento al ritiro.

### Avvio in locale (Windows)
Da `server/`, la prima volta: `npm install`, `npm run setup` (crea `.env` con segreti casuali), poi in un terminale `npm run db` (Postgres, resta aperto) e in un altro `npm run migrate`, `npm run seed`, `npm run dev`. Back office su http://localhost:9000/app. Se Postgres resta acceso dopo aver chiuso il terminale: `npm run db:stop`.
Utente del back office: `npx medusa user -e <email> --invite` genera un invito; la password si sceglie aprendo il link.
Test: `npm run test:unit`, `npm run test:integration:modules`, `npm run test:integration:http` (questi due richiedono `npm run db` acceso).

## Fase 3: collegamento (in corso)
React Router + prerender, IT/EN/DE (ADR 0003); schede prodotto, carrello, checkout, conferma, `/lotto/:codice` con QR, pagine legali e funzione di recesso; test end-to-end Playwright (lotto, checkout ospite, bonifico, recesso).

Fatto (2026-10-14):
- React Router in modalità framework (ADR 0003, rivista: Next.js scartato): `ssr: false`, prerender delle pagine pubbliche in `build/client`, pagina 404. `npm run dev` / `npm run build` / `npm run typecheck` da `client/`.
- Lingue: `/`, `/en/`, `/de/` con `hreflang`, canonical e `lang` per pagina; testi in `client/src/data/content/{it,en,de}.ts`; selettore di lingua nella barra e nel menu del telefono. Le traduzioni vanno riviste da un madrelingua prima della messa online.
- Dominio dei meta tag da `VITE_SITE_URL` al build (segnaposto finché non è scelto).
- Schede prodotto `/prodotti/:handle` (olio-extravergine, miele) nelle tre lingue, prerenderizzate: testi, fatti, dichiarazione nutrizionale (segnaposto in attesa delle analisi), informazioni di legge della linea; formati, prezzi IVA inclusa e disponibilità letti da Medusa nel browser. Le chiamate `/store` passano dal proxy di Vite in sviluppo e da Caddy in produzione (stesso dominio, niente CORS). Chiave pubblica: `npm run storefront-env` da `server/`.
- Carrello e checkout ospite (2026-10-14): carrello in Medusa (nel browser resta solo il suo id), icona con contatore nella barra, "Aggiungi al carrello" nelle schede prodotto e nello shop della home (prezzi e disponibilità da Medusa: niente più prezzi scritti nei contenuti, niente più richiesta via email). `/carrello`: righe, dati, consegna (le opzioni attive in Medusa: oggi solo ritiro a Roseto o Cerchio), pagamento, accettazione delle condizioni, pulsante "Ordina con obbligo di pagamento" (art. 51 Cod. Consumo). `/ordine?id=…`: conferma con coordinate del bonifico o istruzioni per il pagamento al ritiro. Pagine private non indicizzate.
- Pagamenti: due fornitori manuali in Medusa, bonifico (`pp_bonifico_lequote`) e al ritiro (`pp_ritiro_lequote`), così il metodo si legge su ogni ordine nel back office; l'incasso si registra con "Cattura". Su database esistenti li aggiunge alla regione lo script di migrazione `region-manual-payments` (gira con `npm run migrate`). Stripe resta pronto lato server con la chiave; il pagamento con carta nella vetrina si collega quando ci sono le chiavi di prova.
- Gestionale (2026-10-14): lingua italiana impostata al primo accesso; nella scheda ordine il riquadro "Consegna e pagamento" (consegna, metodo di pagamento, telefono, cosa fare). Link "Area riservata" nel footer del sito verso /app.
- Email d'ordine: conferma al cliente nella lingua in cui ha ordinato (con coordinate del bonifico o istruzioni per il ritiro) e avviso ai titolari (ORDER_ALERT_EMAIL) con il link all'ordine. Inviate con l'SMTP della casella esistente (SMTP_* in server/.env, ADR 0004); senza SMTP_HOST, in sviluppo, si salvano in server/.mail.
- Pagamento con carta (Stripe) rinviato (2026-10-21): i titolari confermano che per ora bastano bonifico e pagamento al ritiro. Il server resta pronto con la chiave, la vetrina non lo mostra.
- Controllo lato server (2026-10-21): alla chiusura del carrello il pagamento al ritiro vale solo se ogni consegna è un ritiro in sede (`server/src/workflows/hooks/complete-cart-validate.ts`), anche per chi chiama le API senza passare dalla vetrina.
- QR del lotto (2026-10-21): nella scheda lotto del back office il riquadro "QR per l'etichetta" genera in locale (libreria `qrcode`, nessun servizio esterno) il QR verso `/lotto/<codice>`, scaricabile in SVG per la tipografia e in PNG. Correzione d'errore M, bordo bianco di 4 moduli; in stampa almeno 15 mm di lato. L'indirizzo viene da `STOREFRONT_URL` (obbligatoria in produzione). Lo stesso modulo servirà alle etichette (ADR 0005).
- Pagina `/lotto/:codice` (2026-10-21) nelle tre lingue: campagna, fasi, analisi pubbliche, informazioni di legge; la ricerca nella sezione Filiera ora porta lì. Non prerenderizzata: in produzione Caddy deve servire `__spa-fallback.html` per i percorsi senza file (e inoltrare a Medusa anche `/filiera/*`, i referti pubblici). Lotto di prova per sviluppo e test: `npm run dev:lot` da `server/`.
- Da completare: pagine legali linkate dal checkout (passo 6), funzione di recesso, test end-to-end.

## Fase 4: messa online
VPS (ADR 0004), dopo la validazione legale da parte del consulente.

## Dati mancanti dai titolari
Telefono, P.IVA, social, sede dell'operatore, tariffe e soglia di spedizione, IBAN e intestatario per il bonifico, dati SMTP della casella (server, porta, utente) e indirizzo per gli avvisi d'ordine, orari di ritiro e mezzi accettati al ritiro (contanti / carta), frantoio della campagna, prezzo e foto dei formati (il catalogo attuale ha miele 250 g / 500 g, le etichette prevedono 500 g / 1 kg), misure e grafica delle etichette, hosting e gestore del dominio, video hero in formato sorgente.
