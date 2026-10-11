# 0002. Hybrid supply-chain (filiera) model

- Status: accepted (2026-10-11)

## Context
The real supply chain changes year to year (the third-party frantoio is chosen each campaign; today the frantoio bottles, later a farm laboratory will). The owners want to configure the structure from the back office, but legally relevant data must never be missing.

## Decision
- Fixed, validated fields: lot code (`L…`), product line, origin, harvest campaign, operator, packaging establishment, best-before date, nominal quantity, nutrition declaration (oil), annual analyses attached to the campaign.
- Configurable stage templates per product line: name, order, extra fields, and per-field visibility (`public`, `legal` panel, `internal`).
- Registries: groves, apiaries (BDA code), frantoi, establishments, reused across campaigns.
- Analyses are uploaded once per campaign and linked to every lot of that campaign.
- Internal-only data (SIAN, BDA, suppliers, customers) is never exposed by the public API.

## Consequences
- Adding the farm laboratory is configuration, not code.
- Consumer-facing traceability is two layers: the generic chain on the home page and per-lot pages reached by code or QR.
