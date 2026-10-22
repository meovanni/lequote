# Fase 4: dove mettere online il sito (ricerca del 2026-10-22)

Vincoli dall'ADR 0004: un VPS piccolo con Docker (Medusa, Postgres, Redis, vetrina statica, Caddy),
backup del fornitore, nessun servizio in abbonamento, email dalla casella esistente, eventualmente
un secondo sito sulla stessa macchina.

## Quanto serve

- Medusa in produzione: almeno 2 GB di RAM; la compilazione del back office ne chiede altri 2 GB se
  avviene sul server ([documentazione Medusa](https://docs.medusajs.com/v2/deployment)).
- Con Postgres, Redis, Caddy e un secondo sito: **4 vCPU e 8 GB di RAM** danno margine. Con 4 GB si
  sta stretti, e solo compilando il back office fuori dal server (sul PC o in una pipeline) per
  copiare sul VPS l'immagine Docker già pronta.
- Disco: 40 GB bastano per partire (database piccolo, foto, referti PDF); 80 GB lasciano spazio ai
  backup locali e al secondo sito.
- Traffico: trascurabile per i volumi previsti, tutti i piani lo coprono.

## Fornitori confrontati (prezzi IVA esclusa, verificati sui listini il 2026-10-22)

| Fornitore | Piano | vCPU / RAM / disco | €/mese | Backup | Dove | Note |
|---|---|---|---|---|---|---|
| Aruba Cloud | VPS O4A8 | 4 / 8 GB / 80 GB | 11,79 | giornaliero, 7 giorni, incluso (da confermare per il VPS) | Italia | società italiana: fattura elettronica italiana, assistenza in italiano, nessun vincolo di durata indicato |
| Aruba Cloud | VPS O2A4 | 2 / 4 GB / 40 GB | 6,29 | come sopra | Italia | al limite: solo con il back office compilato fuori dal server |
| OVHcloud | VPS-2 | 4 / 8 GB / 75 GB NVMe | 7,21 | giornaliero, 7 giorni, incluso | Europa (Milano da verificare) | prezzo con ogni probabilità legato a 12 mesi anticipati; filiale italiana (OVH Srl) |
| Hetzner | CX33 | 4 / 8 GB / 80 GB | 8,49 + 0,50 IPv4 | +20% del prezzo | Germania, Finlandia | da settembre 2026 segnalato spesso "non disponibile"; l'alternativa CPX32 costa 35,49 |
| netcup | VPS 1000 G12 | 4 / 8 GB / 256 GB | circa 10,37 IVA tedesca inclusa | non verificato | Germania, Austria | prezzi e condizioni da verificare sul sito |

Costo annuo indicativo con IVA al 22%: Aruba O4A8 circa 173 €, OVHcloud VPS-2 circa 106 €,
Hetzner CX33 con backup circa 156 €.

### Proposta

**Aruba Cloud VPS O4A8.** Non è il più economico, ma per un'azienda agricola italiana conta più del
prezzo:
- fattura elettronica italiana, che entra nella contabilità senza le integrazioni (autofattura, TD17)
  che il commercialista deve fare per un fornitore estero;
- dati in Italia, assistenza in italiano;
- nessun vincolo di durata indicato: si parte e si cambia taglio se serve.

**Alternativa a basso costo: OVHcloud VPS-2**, circa 65 € l'anno in meno, backup giornaliero
incluso, filiale italiana. Prima di sceglierlo va verificato se il prezzo richiede l'anno anticipato
e se la sede di Milano è disponibile per questo piano.

Hetzner, la scelta di riferimento quando abbiamo scritto l'ADR, nel 2026 ha alzato due volte i prezzi
e ha i piani economici spesso esauriti in Europa: lo terrei solo come riserva.

## Backup: oltre a quello del fornitore

Il backup del fornitore protegge dal guasto della macchina, non dalla perdita dell'account o da un
errore che resta nei 7 giorni. Proposta, senza abbonamenti nuovi:
- ogni notte `pg_dump` del database più le cartelle `server/private` (referti) e `server/static`
  (immagini), cifrati;
- copia fuori dal VPS: sul PC dei titolari o su uno spazio di archiviazione di un altro fornitore
  (pochi euro l'anno per pochi GB);
- una prova di ripristino prima della messa online e poi una volta l'anno.

## Cosa serve per andare online

Dai titolari:
- **Dominio:** chi lo gestisce oggi e accesso al pannello DNS (per puntare il sito al VPS e per
  SPF, DKIM e DMARC della posta).
- **Casella email:** fornitore, server SMTP, porta, utente, password dedicata alle email del sito;
  indirizzo che riceve gli avvisi di ordini e recessi (`ORDER_ALERT_EMAIL`).
- **Dati delle pagine legali** già elencati nel piano (ragione sociale, sede, PEC, P.IVA, IBAN...).
- **Validazione del consulente** su condizioni di vendita, privacy, cookie e recesso.

Configurazione del server (`server/.env` in produzione):
- `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `COOKIE_SECRET` (nuovi, mai quelli di sviluppo);
- `STOREFRONT_URL` (indirizzo del sito, usato dai QR in etichetta: va deciso prima di stampare);
- `ADMIN_PUBLIC_URL` (indirizzo del back office, usato negli inviti agli agenti);
- `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS` con i domini veri;
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `ORDER_ALERT_EMAIL`;
- vetrina: `VITE_SITE_URL` e la chiave pubblica al momento del build.

Lavoro nostro:
- `docker-compose` di produzione (Medusa, Postgres, Redis, Caddy) e `Caddyfile`: HTTPS automatico,
  `/store` e `/filiera` inoltrati a Medusa, `__spa-fallback.html` per le pagine non prerenderizzate
  (`/lotto/...`, `/ordine`);
- aggiornamenti di sicurezza automatici, firewall (solo 80, 443 e SSH con chiave);
- durata dei log del server (rimasta aperta dalla Fase 3);
- controllo di raggiungibilità del sito (anche gratuito) con avviso per email;
- prova completa sul server prima di puntare il dominio: ordine con bonifico, ritiro, recesso, QR.

## Fonti

- [Medusa, deployment](https://docs.medusajs.com/v2/deployment)
- [Hetzner, adeguamento prezzi 15 giugno 2026](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/)
- [Hetzner Cloud, review 2026 (backup al 20%)](https://betterstack.com/community/guides/web-servers/hetzner-cloud-review/)
- [Hetzner CX e CAX non disponibili](https://stackvaluelab.com/hetzner-cx-cax-unavailable/)
- [Aruba Cloud, piani VPS](https://www.arubacloud.com/vps/)
- [Aruba, listino cloud](https://www.aruba.it/listino-cloud.aspx)
- [OVHcloud, VPS](https://www.ovhcloud.com/it/vps/)
- [OVHcloud, datacenter di Milano](https://www.ovhcloud.com/fr/datacenter/europe/italy/milan/)
- [netcup, recensione 2026](https://valebyte.com/en/blog/netcup-review-2026-the-price-performance-king-and-its-fine-print/)
