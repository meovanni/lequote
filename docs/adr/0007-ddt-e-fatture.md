# 0007. Delivery notes (DDT) and courtesy invoices from the back office

- Status: accepted (2026-11-10)

## Context
Owners deliver to shops and restaurants (often through agents) and need a transport document with the goods, then an invoice. In Italy the legally valid invoice is the electronic XML sent through SDI; a PDF is only a courtesy copy. The business is under the ordinary VAT regime (owners' answer, 2026-11-10), with VAT shown per product rate (oil 4%, honey 10%, as in Medusa).

## Decision
- **Invoices are courtesy copies.** The accountant issues the real electronic invoice with their own software. The back office produces the PDF for the customer, with the standard note (art. 21 DPR 633/72), and a yearly CSV summary per invoice and VAT rate to hand over. No SDI integration for now (an XML export or a provider integration can come later on the same data).
- **Deferred invoicing.** The DDT is issued at delivery (one per order). An invoice gathers one or more orders of the same customer (same VAT number, else tax code, else name), usually the month's DDTs, and quotes them ("Fattura differita", lines referencing "DDT n. X/AAAA del …"). Orders delivered without a DDT can be invoiced too and are referenced by order code.
- **Who.** Owners do everything from Gestione (DDT from the order detail, invoices and the list in "DDT e fatture"). Agents issue and print the DDT of their own orders from the sales area; they cannot invoice or cancel.
- **Numbering.** Progressive per type and year (Europe/Rome), with no gaps: a transaction-scoped advisory lock serialises issuing, and a unique index guards (kind, year, number). An invoice number can be set higher than the next one (to continue a numbering started elsewhere), never lower. A wrong document is cancelled, not deleted: its number stays and the orders become free for a new one.
- **Immutable snapshots.** Each document stores in `data` the seller (published Dati aziendali), customer, lines and amounts at issue time; later changes to orders or company data do not alter issued documents. Amounts come from Medusa's own tax calculation (net = line total − tax), so invoice totals match orders.
- **PDF** with pdfkit and the PDF standard fonts (no Chromium, no font files), A4, generated on request.
- Module `documenti` (`sales_document`, `sales_document_order`); routes `/admin/documenti/*`, `/admin/gestione/orders/:id/ddt`, `/admin/sell/bookings/:id/ddt(/pdf)`.

## To verify with the accountant
Whether the courtesy PDF numbering must match the electronic invoice (recommended: use the same number), the payment terms wording, and the VAT rate on paid shipping (today Medusa's 22%).
