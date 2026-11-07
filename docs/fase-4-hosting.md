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

## Aggiornamento: volumi minimi, scelta tra Aruba e OVHcloud (2026-10-22)

I titolari hanno delegato la scelta. Accessi contemporanei quasi nulli, anche in avvio: si può
scendere al taglio da **2 vCPU e 4 GB** a queste condizioni:
- il back office si compila fuori dal server (sul PC o in una pipeline gratuita) e sul VPS arriva
  l'immagine Docker già pronta;
- 2 GB di swap come riserva;
- il secondo sito è leggero (statico o simile); se fosse pesante si passa al taglio da 8 GB, su
  entrambi i fornitori si sale di taglio senza reinstallare.

Ogni sito ha il suo dominio con almeno una casella email.

| | OVHcloud | Aruba |
|---|---|---|
| VPS 2 vCPU / 4 GB / 40 GB | VPS-1: 3,81 €/mese con 12 mesi anticipati (45,72 €/anno), circa 4,49 € mensile senza vincolo | O2A4: 6,29 €/mese (75,48 €/anno), nessun vincolo indicato |
| Backup del VPS | giornaliero, 7 giorni, incluso (repliche nello stesso datacenter) | giornaliero, 7 giorni, da confermare per il VPS |
| Dominio .it | 2,99 € il primo anno, 8,99 € il rinnovo | "Dominio con email": 0,99 € il primo anno, 16,49 € il rinnovo |
| Email inclusa | 1 casella da 15 GB per dominio (webmail, IMAP, SMTPS); caselle in più 0,30 €/mese | 5 caselle da 1 GB per dominio |
| Totale con 2 domini, dal secondo anno | circa 64 € + IVA (circa 78 €) | circa 108 € + IVA (circa 132 €) |
| Dove | Europa (Italia da verificare per il VPS-1) | Italia |
| Fattura elettronica italiana | da verificare | sì |

Prezzi IVA esclusa salvo dove indicato, dai listini del 2026-10-22. OVHcloud nel 2026 ha alzato i
prezzi dei VPS: il prezzo di rinnovo va letto nella pagina d'ordine prima di pagare.

**Proposta: OVHcloud**, VPS-1 con 12 mesi anticipati e i due domini .it su OVHcloud, ciascuno con la
sua casella inclusa. Costa circa 50 € l'anno meno di Aruba, ha il backup giornaliero incluso e
caselle più capienti. Per l'affidabilità restano fermi i due punti:
- backup notturno fuori dal VPS (sotto), perché le copie di OVHcloud restano nello stesso
  datacenter;
- prima dell'ordine: prezzo di rinnovo, sede del VPS e fattura elettronica italiana. Se la fattura
  arriva da una società estera, il commercialista deve integrarla (autofattura): in quel caso la
  differenza di prezzo si riduce e Aruba torna in pari.

## Verifica OVHcloud in Italia (2026-10-22)

Dal catalogo pubblico degli ordini (`/1.0/order/catalog/public/vps?ovhSubsidiary=IT`) e dalla
disponibilità per sede (`/1.0/vps/order/rule/datacenter`), le stesse API del configuratore:
- Milano (`EU-SOUTH-MIL`) è tra le sedi ordinabili di tutti i VPS 2027, senza sovrapprezzo;
- **oggi però è esaurita per tutti i piani**; in Europa per Linux è disponibile solo Varsavia, e
  solo per VPS-2 e VPS-3 (il VPS-1 solo in Canada e Singapore);
- prezzi VPS-1 2027: 4,49 €/mese senza vincolo, 4,26 con 6 mesi, 3,81 con 12 mesi anticipati;
  backup automatico Standard (1 giorno) 0,35 €/mese, Premium (7 giorni) 1,10 €/mese.

Conclusione: con OVHcloud oggi un VPS in Italia non si può ordinare, e non c'è una data di
riassortimento. La scelta passa ad **Aruba Cloud VPS O2A4** (Arezzo), con il dominio di Le Quote su
Aruba ("Dominio con email", 5 caselle) accanto a quello di colognasprelax.

## Scelte fatte (2026-10-23)

- Dominio **le-quote.it** su Aruba con "Dominio con email"; `lequote.it` è di un privato (scade il
  2027-09-19): si tiene d'occhio per prenderlo se si libera.
- Email del sito e dei clienti: **info@le-quote.it** (mittente delle email e indirizzo nelle pagine).
- `STOREFRONT_URL` e `VITE_SITE_URL`: `https://le-quote.it`.
- VPS: Aruba Cloud VPS O2A4.

## O1I2 al posto di O2A4? (2026-10-27)

Domanda dei titolari: con il secondo sito tra almeno 10 mesi, basta il VPS O1I2 (1 vCPU, 2 GB,
40 GB, 4,49 €/mese contro 6,29)? Risposta: no, resta O2A4.
- I 4 GB servono a Medusa, non al secondo sito: Medusa da sola chiede almeno 2 GB, e sulla stessa
  macchina girano anche Postgres, Redis, Caddy e il sistema. Con 2 GB si vivrebbe di swap.
- O1I2 è della famiglia "Starter" (processore Intel Broadwell condiviso): nei test pubblici di
  vpsbenchmarks ha voto F su CPU e prestazioni web. O2A4 è della famiglia "Standard" su NVMe.
- Le fonti trovate dicono che si sale di taglio dentro la stessa famiglia; il passaggio da Starter a
  Standard non è confermato e potrebbe voler dire rifare il server.
- La differenza è di 1,80 € al mese, circa 26 € l'anno IVA inclusa.

## Quattro siti sulla stessa macchina: O4A8 (2026-11-07)

Sullo stesso VPS andranno Le Quote, colognasprelax, un sito personale di una pagina e Cantine San
Flaviano (NestJS + MongoDB), tutti con pochi accessi. Memoria stimata:
- Le Quote: Medusa circa 1 GB, Postgres e Redis circa 0,3 GB;
- "Pubblica" dei contenuti (ADR 0006) compila la vetrina sul server: circa 1–1,5 GB per un minuto;
- Cantine San Flaviano: NestJS circa 0,2 GB, MongoDB 0,3–0,5 GB (cache limitata con
  `--wiredTigerCacheSizeGB 0.25`, altrimenti ne prende metà della RAM);
- siti statici, Caddy e sistema: circa 0,4 GB.

A regime circa 2,5–3 GB, con un picco oltre i 4 GB quando si pubblica: il taglio O2A4 non basta più.
Scelta: **Aruba Cloud VPS O4A8** (4 vCPU, 8 GB, 80 GB, 11,79 €/mese + IVA dal listino del
2026-10-22, circa 173 € l'anno IVA inclusa). Ogni sito con il suo dominio e "Dominio con email".

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
- [vpsbenchmarks, Aruba VPS O1I2](https://vpsbenchmarks.com/hosters/aruba_cloud/plans/vps-o1i2)
- [Aruba, listino cloud](https://www.aruba.it/listino-cloud.aspx)
- [OVHcloud, VPS](https://www.ovhcloud.com/it/vps/)
- [OVHcloud, datacenter di Milano](https://www.ovhcloud.com/fr/datacenter/europe/italy/milan/)
- [OVHcloud, domini](https://www.ovhcloud.com/it/domains/)
- [OVHcloud, email](https://www.ovhcloud.com/it/emails/)
- [OVHcloud VPS-1, prezzi mensile e annuale](https://www.vpsbenchmarks.com/hosters/ovhcloud/plans/vps-1)
- [Aruba, offerte dominio con email](https://hosting.aruba.it/en/domain-hosting-offers-aruba)
- [Aruba, rinnovo dominio .it 2026](https://www.danielechiuri.it/aruba-dominio-it-prezzo-rinnovo-2026/)
- [netcup, recensione 2026](https://valebyte.com/en/blog/netcup-review-2026-the-price-performance-king-and-its-fine-print/)

## Contenuti dal back office (2026-11-05, ADR 0006)

- Caddy inoltra a Medusa anche `/contenuti/*` (le foto caricate), come `/store/*`.
- Il server deve poter rigenerare la vetrina: `STOREFRONT_DIR` punta ai sorgenti di `client/` con le
  dipendenze installate, `STOREFRONT_BUILD_COMMAND` compila e copia `build/client/` nella cartella
  servita da Caddy.
- `CONTENT_IMAGES_DIR` (foto caricate) va nei backup insieme al database.
