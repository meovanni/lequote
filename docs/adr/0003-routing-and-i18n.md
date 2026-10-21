# 0003. React Router in framework mode, static prerender, IT/EN/DE

- Status: accepted (2026-10-11), revised 2026-10-14 (framework mode; Next.js considered and rejected), implemented in phase 3

## Context
A single anchor page cannot host product pages, cart, checkout, order confirmation, lot pages reached by QR, legal pages and the mandatory online withdrawal function (Codice del Consumo art. 54-bis from 2026-06-19).

Before phase 3 the owners asked whether to move the storefront to Next.js for a more solid, secure product ready for more complex integrations. Considered:
- **Next.js.** Medusa's official starter is Next.js and already has cart, checkout and regions. It needs a Node server for the storefront: one more process to patch and monitor on a small, possibly shared VPS (ADR 0004), and Next's server side has had severe advisories (2025 middleware authorisation bypass, 2025 React Server Components remote code execution). It means rewriting the phase 1 sections; the starter's UI would be replaced anyway to follow DESIGN.md. Its strengths (per-request rendering, large or personalised catalogues, managed hosting) are not needs here.
- **React Router in framework mode.** Routes, per-route data loading, error boundaries and code splitting on the same Vite toolchain; existing components, CSS Modules and tests carry over. Public pages are prerendered to static HTML; the site stays static files behind Caddy with no storefront server. Server rendering can be switched on later with one setting if a real need appears.

Security, stability and integrations (payments, e-invoicing, couriers, accounting) live in Medusa, not in the storefront.

## Decision
React Router in framework mode with `ssr: false` and build-time prerendering of public pages. The narrative home stays one page; other pages are routes. Dynamic data (prices, stock, cart, checkout, lot pages from QR, withdrawal) is read from the Medusa Store API in the browser.

Languages: Italian at `/`, English at `/en/`, German at `/de/`, with `hreflang`. Translatable back-office fields have Italian mandatory and fall back to Italian. The back office stays Italian only. Mandatory label information is always available in Italian (Reg. 1169/2011 art. 15).

## Consequences
React Router (with `@react-router/dev` as build tool) is the one new front-end dependency; PRODUCT.md records it. Phase 1 content is kept in `content.ts`, separate from components, so translation is additive. Revisit Next.js or React Router server rendering only if the catalogue becomes large, prices become per-customer, or pages need per-request data for search engines.
