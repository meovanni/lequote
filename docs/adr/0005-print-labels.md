# 0005. Product labels generated from lot data

- Status: accepted (2026-10-11), implemented in phase 2

## Decision
Four formats: honey 500 g and 1 kg, oil bottle and tin (tin max 5 L, Reg. del. UE 2022/2104 art. 4). Templates are HTML/CSS in millimetres, versioned in code (no drag-and-drop editor). The back office chooses format and lot, edits variable texts, sets copies, previews, exports. Lot data (code, best-before, campaign, origin, operator, establishment, quantity, nutrition, QR to `/lotto/:code`) fills automatically.

Export via headless Chromium (Playwright) to two outputs: print-shop PDF (CMYK PDF/X via Ghostscript, 3 mm bleed, crop marks) and A4 adhesive sheets for office printers.

Compliance check before export: missing mandatory fields block; size rules (x-height ≥ 1.2 mm, Reg. 1169/2011 art. 13; oil origin ≥ 1.2 mm, L. 9/2013; nominal quantity minimum heights, to verify) warn and require a recorded "verificato" acknowledgement.
