# 0001. Medusa v2 as commerce back end

- Status: accepted (2026-10-11)

## Context
The site needs a real shop (cart, orders, customers, prices, stock per lot, payments) and a back office the family can use. Writing checkout, payment states and refunds from scratch is the riskiest part of the project; the supply chain (filiera) is the farm's own domain and needs custom code.

## Decision
Use Medusa v2 (Node/TypeScript, Postgres) for commerce, with its admin extended by custom modules (Filiera, Labels, site content). Monorepo: `client/` (storefront, Vite/React) and `server/` (Medusa + modules).

Payments: Stripe (per-transaction fees only, no monthly fee) plus Medusa's manual provider for bank transfer and pay-on-pickup. Orders not paid online enter as "da confermare". Guest checkout plus optional account. Shipping to Italy only, modelled with zones so EU can be enabled by configuration. No e-invoicing, no accounting, no EAN.

## Consequences
- Commerce primitives come tested; effort goes to the filiera and labels.
- Requires a Node server, Postgres and Redis: a VPS, not shared PHP hosting (see 0004).
- Medusa upgrades become a maintenance task.
