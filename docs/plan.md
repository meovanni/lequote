# Piano a fasi

Decisioni: `../PRODUCT.md`, `../DESIGN.md`, `adr/`.

## Fase 1: vetrina (completata il 2026-10-11; su telefono scroll del tutto nativo dopo la prova su iPhone)
- Redesign ibrido Seed / Le Quote (DESIGN.md): titoli leggeri, pillole, niente ombre né gradienti decorativi, specimen tag mono, ritmo chiaro / bosco.
- Hero: foto poster + video MP4/WebM dove disponibile.
- Nuove sezioni con contenuti statici tipizzati come le future API: Filiera e tracciabilità (pannello "Informazioni di legge", campo lotto non ancora attivo), Calendario delle stagioni, Domande frequenti.
- Correzione dei testi non dimostrabili (acidità, descrittori organolettici, alveari solo a Cerchio).
- Test unitari e di componente (Vitest).

## Fase 2: back end e gestionale (in corso)
Medusa v2 + Postgres; moduli Filiera (ADR 0002), Etichette (ADR 0005), contenuti (calendario, FAQ, testi); catalogo, ordini, clienti, magazzino per lotto; pagamenti Stripe + manuale.

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

## Fase 3: collegamento
React Router + prerender, IT/EN/DE (ADR 0003); schede prodotto, carrello, checkout, conferma, `/lotto/:codice` con QR, pagine legali e funzione di recesso; test end-to-end Playwright (lotto, checkout ospite, bonifico, recesso).

## Fase 4: messa online
VPS (ADR 0004), dopo la validazione legale da parte del consulente.

## Dati mancanti dai titolari
Telefono, P.IVA, social, sede dell'operatore, tariffe e soglia di spedizione, frantoio della campagna, prezzo e foto dei formati (il catalogo attuale ha miele 250 g / 500 g, le etichette prevedono 500 g / 1 kg), misure e grafica delle etichette, hosting e gestore del dominio, video hero in formato sorgente.
