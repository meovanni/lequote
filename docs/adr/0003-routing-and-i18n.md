# 0003. React Router with prerendering, IT/EN/DE

- Status: accepted (2026-10-11), implemented in phase 3

## Context
A single anchor page cannot host product pages, cart, checkout, order confirmation, lot pages reached by QR, legal pages and the mandatory online withdrawal function (Codice del Consumo art. 54-bis from 2026-06-19).

## Decision
Keep the narrative home as one page; add React Router (declarative mode) for the other pages, with static prerendering of public pages for SEO. Languages: Italian at `/`, English at `/en/`, German at `/de/`, with `hreflang`. Translatable back-office fields have Italian mandatory and fall back to Italian. The back office stays Italian only. Mandatory label information is always available in Italian (Reg. 1169/2011 art. 15).

## Consequences
React Router is the one new front-end dependency; PRODUCT.md records it. Phase 1 content is kept in `content.ts`, separate from components, so translation is additive.
