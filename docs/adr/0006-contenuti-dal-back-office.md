# 0006. Site content edited from the back office, published by rebuilding the static site

- Status: accepted (2026-11-05)

## Context
The owners want to change every text and photo of the storefront (home sections, product pages, purchase flow, legal pages, company data) from the back office, in Italian, English and German. The storefront is prerendered static HTML (ADR 0003).

## Decision
- The texts in `client/src/data/content`, `client/src/data/legal` and `client/src/data/business.ts` stay the starting point. The back office stores only the changes, keyed by path (`hero.title`), in a Medusa module `contenuti`: a draft value and a published value per key and language (`shared` for photos and company data).
- `npm run content:export` (client) writes the list of editable fields with their starting texts to `server/src/modules/contenuti/defaults.generated.json`; a client test fails when it is stale. The server accepts only keys from that list. Identifiers, internal links and wordings fixed by law (art. 51 and 54-bis Cod. Consumo) are not editable.
- "Pubblica" writes the changes to `client/src/data/published/published.generated.json` and runs `STOREFRONT_BUILD_COMMAND` (none in development: Vite reloads the file). If the build fails the previous file is restored and the drafts stay unpublished.
- Changed company data (VAT number, address, IBAN…) is replaced wherever its starting value appears in the texts; order emails read the published IBAN and holder.
- Uploaded photos live on disk (`CONTENT_IMAGES_DIR`) and Medusa serves them at `/contenuti/immagini/<random name>`; the storefront reaches them on the same domain (Vite proxy in development, Caddy in production).

## Consequences
Pages stay static and indexable with the new text, at the cost of about a minute per publication. Adding or removing items (a new FAQ, a new filiera step) still needs a code change. The storefront source and its dependencies must be available to the server for the build in production (phase 4).
