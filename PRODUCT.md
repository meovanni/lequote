# Product

<!-- impeccable:product-schema 1 -->

## Platform

web (public site + shop) and web back office (gestionale), see `docs/adr/` and `docs/plan.md`.

## Users

- **Consumers** (Italian first, then English- and German-speaking tourists visiting the Abruzzo coast and Aquilano hinterland): learn the producer's story and products, check a bottle or jar's traceability by lot code, buy for delivery in Italy or pickup at one of the two sites.
- **The family running the farm** (non-technical): configure the supply chain (filiera), lots, analyses, prices, images, orders, customers, site content and product labels from a back office.

## Product Purpose

Brand site, traceability reference and small direct-to-consumer shop for Le Quote, a family farm spanning two very different Abruzzo territories, with two product lines (extra-virgin olive oil, honey). Behind it, a lightweight farm management back office (gestionale).

## Positioning

One family farming across roughly 800m of elevation: the sea-level site at Roseto degli Abruzzi / Riserva del Borsacchio (olive groves, olives pressed within hours of harvest) and the mountain site at Cerchio in the Aquilano hinterland (apiaries, cold-extracted honey). The oil is the sea's elevation, the honey the mountain's. "Due quote, la stessa terra" is the framing carried through the site.

## Operating Context (facts confirmed by the owners, 2026-10-11)

- Olives come only from the farm's own groves. Pressing is always done by a third-party frantoio, chosen year by year. For now the frantoio also bottles; a farm-owned laboratory is planned.
- Apiaries are only at Cerchio (none at the coastal site).
- Chemical and organoleptic analyses are done every year.
- Visits and tastings happen on request by email; there is no booking flow.

## Capabilities and Constraints

- Phase 1 (current): single-page narrative site with static content in `client/src/data/content.ts`, typed in the shape the future API will return. Shop is an order-request form that opens the visitor's email client.
- Planned (phases 2 to 4, see `docs/plan.md`): Medusa v2 + Postgres back end with a custom Filiera module and a Labels module (print PDFs); React Router with prerendered pages (product, cart, checkout, order, `/lotto/:code`, legal pages, withdrawal function); Italian, English, German; Stripe, bank transfer and pay-on-pickup; shipping to Italy only; self-hosted on a small VPS, no subscription services.
- Not yet confirmed, placeholders in copy: phone number, P.IVA, social links, operator address, shipping rates, the current year's frantoio. Do not fill these with invented values.
- Front-end architecture: React 19 + TypeScript + Vite, plain CSS Modules, no Tailwind, no animation library. Motion is native CSS scroll-driven animation with JS fallback. React Router is the one accepted addition (phase 3).

## Legal Commitments

- Mandatory consumer information (Reg. UE 1169/2011 art. 9 and 14; Reg. del. UE 2022/2104 for oil; D.Lgs. 179/2004 as amended by D.Lgs. 207/2025 for honey; L. 9/2013) is always reachable before purchase, folded in an "Informazioni di legge" panel where it would crowd the narrative.
- Internal registers (Reg. CE 178/2002 art. 18, SIAN, BDA) are kept in the back office and never published.
- No claims the farm cannot document: acidity or other chemical values only with that year's full analysis; organoleptic descriptors only with a panel test; floral honey names only with the botanical analysis; no generic environmental claims (D.Lgs. 30/2026); no "certificata" without third-party certification.
- All legal texts are drafts with cited sources until validated by the farm's consultant.

## Brand Commitments

- Name: Le Quote. Logo at `client/public/images/logo_main.svg`.
- Palette, type and component rules: see `DESIGN.md` (hybrid of the original ledger system with the Seed reference's restraint).
- Copy voice: Italian, first-person plural, unhurried and concrete, grounded in place names and verifiable facts. No em dashes.
- Signature interaction: the Territorio pinned scroll reveal over the real province silhouette.

## Evidence on Hand

Real photography in `client/public/images/`: `oliveto.jpg`, `arnie.jpg`, `albero.jpg`, `bottiglia1.png`, `bottiglia2.png`, `miele.png`. Hero video (`intro_long.mov`, HEVC) lives outside git. Annual analyses exist but are not yet in the project. No testimonials, press, or customer data: do not fabricate.

## Product Principles

1. Provenance over persuasion: ground every claim in Borsacchio/Cerchio geography and documented facts.
2. Reference before advert: traceability and legal information are first-class content, presented calmly.
3. Honest about what isn't live: never imply a capability (checkout, booking, lot lookup) before it exists.
4. Local-first, tourist-legible.
5. One quiet architecture, minimal running costs.
