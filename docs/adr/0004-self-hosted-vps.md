# 0004. Self-hosted on a small VPS, no subscription services

- Status: accepted (2026-10-11); provider choice deferred

## Context
Volumes will be very low; the site is mostly informational plus the back office. The owners want to contain costs and avoid subscription services. The VPS may be shared with another site.

## Decision
A small VPS (Hetzner-class) running Docker: Medusa, Postgres, Redis, the static storefront, Caddy as reverse proxy for both domains. Provider backups enabled. Transactional email through the SMTP of the existing mailbox. Images on local disk via Medusa's local file provider. Development runs locally with Docker until hosting is chosen.

## Consequences
Updates, monitoring and security patches are on us. Shared PHP hosting is not an option.
