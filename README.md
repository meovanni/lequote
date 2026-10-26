# Le Quote

Sito e gestionale dell'azienda agricola Le Quote: vetrina in tre lingue con filiera e shop, back office per ordini, lotti e analisi.

| Cartella | Cosa contiene | In sviluppo |
| --- | --- | --- |
| `client/` | Vetrina: React 19, React Router (modalità framework, pagine statiche), CSS Modules, Motion | http://localhost:5173 |
| `server/` | Back end e back office: Medusa v2, Postgres, modulo Filiera | http://localhost:9000/app |
| `docs/` | Piano a fasi (`plan.md`) e decisioni (`adr/`) | |

Il contesto del prodotto è in `PRODUCT.md`, le regole grafiche in `DESIGN.md`.

## Requisiti

- Node.js 20 o successivo (provato con la 24) e npm.
- Git.
- Nient'altro: in sviluppo Postgres parte da npm (`embedded-postgres`), senza Docker né installazioni di sistema. Funziona su Windows, macOS e Linux.

## Prima volta

### Back end (`server/`)

```sh
cd server
npm install
npm run setup      # crea .env con segreti casuali (non va mai sotto git)
```

Poi servono due terminali.

Terminale 1, il database (resta aperto):

```sh
cd server
npm run db
```

Terminale 2, struttura del database, dati iniziali e avvio:

```sh
cd server
npm run migrate    # crea le tabelle
npm run seed       # regione Italia, sedi, catalogo, anagrafiche e modelli di fase della filiera
npm run dev        # back office su http://localhost:9000/app
```

Crea il tuo utente del back office (con il server acceso, in un altro terminale):

```sh
cd server
npx medusa user -e tua@email.it --invite
```

Il comando stampa un link di invito: aprilo e scegli la password.

### Vetrina (`client/`)

Collega la vetrina a Medusa: con il back end acceso (`npm run db`), una sola volta dopo il seed:

```sh
cd server
npm run storefront-env   # scrive la chiave pubblica della vetrina in client/.env.local
npm run dev:stock        # facoltativo, solo sviluppo: magazzino di prova per provare il checkout
```

Poi:

```sh
cd client
npm install
npm run dev        # http://localhost:5173 (italiano), /en/, /de/
```

Prezzi e disponibilità nelle schede prodotto arrivano da Medusa: senza back end acceso la vetrina funziona, ma le schede mostrano un avviso al posto dei prezzi. In sviluppo le chiamate `/store` passano dal server della vetrina (proxy di Vite), quindi non serve configurare CORS.

Per provarla dal telefono sulla stessa rete Wi-Fi: `npm run dev -- --host`, poi apri l'indirizzo "Network" che compare nel terminale.

## Avvio di tutti i giorni

1. `cd server && npm run db` (terminale 1, resta aperto)
2. `cd server && npm run dev` (terminale 2)
3. `cd client && npm run dev` (terminale 3)

Per spegnere: Ctrl+C in ogni terminale. Se Postgres resta acceso dopo aver chiuso il terminale (per esempio la porta 5433 risulta occupata al riavvio): `cd server && npm run db:stop`.

Dopo un `git pull` che porta nuove migrazioni: `cd server && npm run migrate`. Dopo modifiche a `package.json`: `npm install` nella cartella interessata.

## Comandi utili

### Vetrina (`client/`)

| Comando | Cosa fa |
| --- | --- |
| `npm run dev` | Server di sviluppo con ricarica automatica |
| `npm test` | Test unitari e di componente (Vitest) |
| `npm run typecheck` | Controllo dei tipi |
| `npm run lint` | Linter (oxlint) |
| `npm run build` | Build di produzione: pagine statiche in `client/build/client` |
| `npm run preview` | Serve la build per provarla in locale |

Il dominio usato nei meta tag (canonical, Open Graph, hreflang) si imposta al build: `VITE_SITE_URL=https://dominio.it npm run build`. Finché non è scelto resta un segnaposto.

### Back end (`server/`)

| Comando | Cosa fa |
| --- | --- |
| `npm run db` / `npm run db:stop` | Avvia / ferma Postgres di sviluppo (porta 5433, dati in `server/.pgdata`) |
| `npm run dev` | Medusa con back office, ricarica automatica |
| `npm run migrate` | Applica le migrazioni del database |
| `npm run seed` | Dati iniziali (da lanciare su un database vuoto) |
| `npm run storefront-env` | Scrive la chiave pubblica della vetrina in `client/.env.local` |
| `npm run dev:stock` | Solo sviluppo: magazzino di prova (300 L d'olio e 60 kg di miele sfusi, qualche pezzo pronto) per provare carrello e checkout; il magazzino nasce vuoto |
| `npm run typecheck` | Controllo dei tipi di server e back office |
| `npm run test:unit` | Test unitari |
| `npm run test:integration:modules` | Test del modulo Filiera sul database (serve `npm run db` acceso) |
| `npm run test:integration:http` | Test delle API (serve `npm run db` acceso) |

## Configurazione

Tutta la configurazione del back end sta in `server/.env`, generato da `npm run setup` a partire da `server/.env.template` (lì ogni voce è commentata). Facoltativi:

- `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`: attivano il pagamento con carta (chiavi di test `sk_test_…` in sviluppo).
- `REDIS_URL`: in produzione; in sviluppo non serve.
- `FILIERA_FILES_DIR`: dove salvare i referti di analisi (di default `server/private/filiera`, da includere nei backup).

Non mettere mai segreti nel codice né `.env` sotto git.

## Problemi frequenti

- **`npm run dev` del server non si collega al database**: controlla che `npm run db` sia acceso nell'altro terminale.
- **Porta 5433 o 9000 già in uso**: un'istanza precedente è rimasta accesa. Per Postgres `npm run db:stop`; per Medusa chiudi il terminale che la esegue.
- **La vetrina mostra contenuti vecchi dopo un cambio di dipendenze**: ferma `npm run dev`, poi riavvialo (Vite ricostruisce la cache).
- **Email d'ordine in sviluppo**: senza `SMTP_HOST` in `server/.env` non partono; ogni ordine salva in `server/.mail` la conferma al cliente e l'avviso ai titolari (`.html` da aprire nel browser). Per l'avviso serve `ORDER_ALERT_EMAIL`.
- **Gestionale in inglese**: la lingua si sceglie in Impostazioni › Profilo; al primo accesso da un browser parte in italiano.
- **Database da rifare da zero**: ferma tutto, cancella `server/.pgdata`, poi `npm run db`, `npm run migrate`, `npm run seed`.

## Produzione

Piccolo VPS con Docker (Medusa, Postgres, Redis, Caddy) e la vetrina servita come file statici: vedi `docs/adr/0004-self-hosted-vps.md` e la fase 4 in `docs/plan.md`.
