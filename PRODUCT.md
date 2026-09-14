# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience: Italian private consumers and tourists/visitors to the Abruzzo coast and Aquilano hinterland. They arrive to learn the producer's story and products, either ahead of a future online purchase (e-commerce is not live yet) or ahead of an in-person visit/tasting at one of the two sites.

## Product Purpose

Brand and brochure site for Le Quote, a family-run agricultural business, telling the story of a single operation spanning two very different Abruzzo territories and presenting its two product lines (extra-virgin olive oil, honey). Captures interest by email until the online shop opens.

## Positioning

The mechanism a competitor could not truthfully copy: one family farming across roughly 800m of elevation difference within the same small operation — a sea-level site at Roseto degli Abruzzi / Riserva del Borsacchio (olive groves, pressed within hours of hand harvest) and a mountain site at Cerchio in the Aquilano hinterland (wild-forage apiaries, cold-extracted honey). "Due quote, la stessa terra" (two elevations, the same land) is the explicit framing already carried through the site's structure (the Territorio section) and copy.

## Operating Context

Two real, physically distinct working sites. Olive harvest is manual or lightly mechanized, taken to the frantoio within hours of picking. Honey is cold-extracted to preserve enzymes/aroma, sourced from spontaneous bloom that differs by site and season. In-person visits/tastings are implied by the site's contact framing ("Vieni a trovarci, a qualsiasi quota") but not yet formalized into a booking flow. The only live contact channel today is email (info@lequote.it).

## Capabilities and Constraints

- Single-page site, six anchor sections (Hero, Chi siamo, Territorio, Olio, Miele, Shop, Contatti/Footer), no client-side routing.
- No e-commerce yet: the Shop section is an explicit "coming soon" placeholder whose only action is a `mailto:` link.
- Not yet confirmed, currently placeholders in copy: phone number, P.IVA, and the Instagram/Facebook social links (`href="#"`). Do not fill these with invented values.
- Deliberate technical constraint carried by the existing codebase: React 19 + TypeScript + Vite, plain CSS Modules only, no Tailwind, no animation library (no Motion/Framer, no GSAP). All motion is native CSS scroll-driven animation (`animation-timeline`) with a hand-built JS fallback for browsers without it (built and cross-browser-verified for Firefox). Future visual work should work within this architecture rather than introduce a library layer.

## Brand Commitments

- Name: Le Quote. Logo asset at `client/public/images/logo_main.svg`.
- Established palette: `--color-miele #9c6530` (honey/brass, primary accent) with light-surface tint `--color-miele-tint #cc9a5e`; `--color-oliva #4c5735` (secondary accent); neutrals `--color-pergamena #f7f3e8` / `--color-avorio #efe7d4`; `--color-bosco #1c2417` (dark green, reserved for exactly two sections: Shop and Footer); ink text `--color-inchiostro #233142` on light, `--color-bone #f3eedf` on dark.
- Type pairing: Fraunces Variable (display/headings, tuned per-context via variable-font optical size and softness axes) + Instrument Sans Variable (body) + DM Mono (eyebrows, nav, buttons, figures).
- Copy voice: Italian, first-person-plural, unhurried and concrete — grounded in real place names and numbers (800m dislivello, cultivar names) rather than marketing abstraction.
- Signature interaction: the Territorio section's pinned scroll-zoom reveal (a mask shaped as the real province silhouette grows over a photo, sequencing two location markers with info cards and a photo crossfade) — a bespoke, already-hardened asset, not a template pattern.

## Evidence on Hand

Real photography in `client/public/images/`: `oliveto.jpg` (Borsacchio olive grove), `arnie.jpg` (Cerchio apiaries), `albero.jpg`, `bottiglia1.png` / `bottiglia2.png` (oil bottle), `miele.png` (honey jars). No testimonials, case studies, press mentions, pricing, or customer data exist anywhere in the project — future work must not fabricate these.

## Product Principles

1. Provenance over persuasion — the two-elevation story is the actual differentiator; ground claims in the real Borsacchio/Cerchio geography rather than generic artisanal-quality language.
2. Local-first, tourist-legible — write and design for an Italian audience that may already know the area, without excluding a first-time visitor encountering the story cold.
3. Honest about what isn't live yet — no shop/checkout, no confirmed phone/P.IVA/socials; never imply a capability (bulk ordering, instant purchase, booking) that doesn't exist.
4. One quiet architecture — plain CSS Modules and native scroll-driven animation only; this is a deliberate, tested choice, not a gap to fill with a library.
