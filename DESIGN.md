---
name: Le Quote
description: Brochure and (soon) shop for a family farm spanning two Abruzzo elevations, told through a warm-neutral canvas alternating with deep grove-green bands, whisper-weight serif headlines, and a real-geography scroll reveal.
colors:
  honey-brass: "#9c6530"
  honey-brass-tint: "#cc9a5e"
  olive-leaf: "#4c5735"
  night-grove: "#1c2417"
  warm-parchment: "#f7f3e8"
  soft-ivory: "#efe7d4"
  ink: "#233142"
  bone: "#f3eedf"
typography:
  display:
    fontFamily: "'Fraunces Variable', 'Fraunces', 'Iowan Old Style', Georgia, serif"
    fontSize: "clamp(2.75rem, 6vw + 1rem, 6rem)"
    fontWeight: 340
    lineHeight: 0.98
    letterSpacing: "-0.02em"
    fontVariation: "'opsz' 144, 'SOFT' 0"
  headline:
    fontFamily: "'Fraunces Variable', 'Fraunces', 'Iowan Old Style', Georgia, serif"
    fontSize: "clamp(2rem, 3.2vw + 1rem, 3.25rem)"
    fontWeight: 340
    lineHeight: 1.05
    letterSpacing: "-0.018em"
    fontVariation: "'opsz' 96, 'SOFT' 0"
  title:
    fontFamily: "'Fraunces Variable', 'Fraunces', 'Iowan Old Style', Georgia, serif"
    fontSize: "clamp(1.5rem, 2vw + 1rem, 2.25rem)"
    fontWeight: 360
    lineHeight: 1.12
    letterSpacing: "-0.015em"
    fontVariation: "'opsz' 72, 'SOFT' 0"
  body:
    fontFamily: "'Instrument Sans Variable', 'Instrument Sans', sans-serif"
    fontSize: "clamp(1rem, 0.3vw + 0.95rem, 1.0625rem)"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "'DM Mono', ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    letterSpacing: "0.1em"
rounded:
  sm: "8px"
  card: "16px"
  lg: "32px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "80px"
  "9": "128px"
components:
  button-primary:
    backgroundColor: "{colors.honey-brass}"
    textColor: "{colors.bone}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    border: "1.5px solid currentColor"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  specimen-tag:
    backgroundColor: "transparent"
    border: "1.5px solid currentColor"
    rounded: "{rounded.pill}"
    padding: "6px 10px"
    fontFamily: "{typography.label.fontFamily}"
  card:
    backgroundColor: "{colors.soft-ivory}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px"
---

# Design System: Le Quote

## Overview

**Creative North Star: "Il Registro sotto vetro" (The Ledger Under Glass)**

The farm's own record book, set out like a specimen under laboratory glass. The system keeps the original ledger idea (precise, unhurried, fact over adjective) and adopts the restraint of a botanical-clinical reference (Seed): whisper-weight headlines, perfectly flat surfaces, pill-shaped controls, mono "specimen labels" for codes and dates, and a calm alternation between warm-parchment and deep grove-green bands. Credibility comes from typographic confidence and chromatic silence, not visual volume. This matters more now that the site carries legally-relevant traceability content: it must read as a reference, not an advert.

What stays Le Quote, not Seed: the palette (honey, olive, grove, parchment, the logo's ink blue), the one serif family (Fraunces), and the Territorio signature reveal. Seed's lime accent and its sans-serif display voice are deliberately not adopted.

Confirmed rejections: no Tailwind, no animation library (Motion/Framer/GSAP), no box-shadows or drop-shadows, no decorative gradients (a functional legibility scrim over video/photo is the single exception), no AI-purple or glass-panel decoration, no generic three-card feature grids, no em dashes in shipped copy or headings.

**Key Characteristics:**
- Warm-neutral canvas alternating with full-bleed Night Grove bands as page rhythm.
- One spent-sparingly interactive accent (Honey Brass), one structural accent (Olive Leaf).
- Whisper-weight Fraunces (300 to 380) for every display role.
- Flat, shadowless surfaces; hierarchy from colour contrast, weight and space only.
- Pills for every button, badge and tag; 16px cards; 32px large containers.
- Mono specimen tags (DM Mono, outlined pill) for lot codes, harvest years, step numbers, analysis figures.

## Colors

### Primary
- **Aged Honey Brass** (#9c6530): the one call-to-action and wayfinding colour on light surfaces: primary buttons, active nav indicator, map-marker dots, focus ring.
- **Honey Brass Tint** (#cc9a5e): the same role on Night Grove, plus the one "switched on" accent for small badges (the role Seed gives its lime). Never a surface larger than a badge.

### Secondary
- **Deep Olive Leaf** (#4c5735): structural, never interactive: rules, timeline bars for the olive line, small markers.

### Neutral
- **Warm Parchment** (#f7f3e8): primary light surface.
- **Soft Ivory** (#efe7d4): secondary light surface and card fill on parchment.
- **Night Grove** (#1c2417): dark surface for the alternating bands (Hero, Olio, Filiera, Shop, Footer).
- **Deep Ink Blue** (#233142): text on light surfaces (the logo's ink).
- **Bone** (#f3eedf): text on Night Grove.
- **Error Brick** (#a8402c, tint #e2836a on dark): form validation only.

### Named Rules
**The Two-Accent Discipline Rule.** Honey is the only interactive/wayfinding colour; Olive is the only structural accent. They never share a job; no third hue without revising this file.

**The Rhythm Rule.** Sections alternate between light (parchment/ivory) and Night Grove at full bleed. Two light sections may sit together; two dark sections may not.

## Typography

**Display:** Fraunces Variable. **Body:** Instrument Sans Variable. **Label/Mono:** DM Mono.

### Hierarchy
- **Display** (340, `clamp(2.75rem, 6vw + 1rem, 6rem)`, lh 0.98, -0.02em): hero.
- **Headline** (340, `clamp(2rem, 3.2vw + 1rem, 3.25rem)`, lh 1.05, -0.018em): section titles.
- **Title** (360, `clamp(1.5rem, 2vw + 1rem, 2.25rem)`, lh 1.12): product subtitles.
- **Card title** (380, `clamp(1.25rem, 1vw + 1rem, 1.5rem)`, lh 1.2): steps, markers, FAQ questions.
- **Body** (400, lh 1.65), **body-lead** (1.25rem/1.6), **body-sm** (0.875rem, 500).
- **Label** (DM Mono 500, 0.8125rem, 0.1em, uppercase): nav, buttons, eyebrows. **Specimen** (DM Mono 400, 0.75rem, 0.04em, no uppercase transform for codes): lot codes, dates, figures, with tabular numbers.

### Named Rules
**The Whisper Rule.** Display roles stay between 300 and 380. On Night Grove or over video, every display role sits at the top of the range (380) for legibility. Never 600+ on a headline.

**The One-Serif Rule.** Every display need is Fraunces on its own axes (opsz per role, SOFT 0 for the crisper reference voice). Emphasis inside a headline is italic, not weight.

## Layout

Full-viewport (`100svh`) sections with `scroll-snap-align: start` against site-wide `scroll-snap-type: y mandatory` on mouse devices only. Touch, hover-less and narrow (≤1024px) devices get fully native scrolling: no snap, no scroll-driven animation, no pinned sequence (Territorio becomes a static map plus the two place cards). On WebKit, fast inertial scrolling with a direction change made the page jump elsewhere. The query lives in `client/src/lib/nativeScroll.ts` and is repeated in the stylesheets. Content max-width 1240px, inline padding `clamp(1.25rem, 4vw, 3rem)`. Spacing on a 4/8px scale up to 128px; section vertical padding at least 80px. Content sections use asymmetric two-column splits (roughly 40/60), not equal columns. Breakpoints are literal values per stylesheet: 480 / 768 / 1024 / 1280px. Territorio remains the one pinned multi-stage exception (580vh).

Section order and surfaces: Hero (dark, video/photo) · Chi siamo (ivory) · Territorio (parchment) · Olio (grove) · Miele (ivory) · Filiera (grove) · Stagioni (parchment) · Shop (grove) · Domande (ivory) · Footer (grove).

## Elevation & Depth

None. The system is shadowless: no box-shadow, no drop-shadow, no glow. Hierarchy comes from surface contrast (ivory card on parchment, bone hairline on grove), weight, and space. A floating callout (Territorio markers) is distinguished by a solid surface fill and a 1.5px hairline, not a shadow. The only gradient allowed is a functional dark scrim over the hero video/photo so Bone text stays legible.

## Shapes

`sm` 8px (inputs, small inner elements), `card` 16px (cards, photo frames, panels), `lg` 32px (large containers, the hero media frame on wide screens), `pill` 999px (every button, badge, tag, chip). Square or 4 to 10px corners on buttons are not allowed.

## Components

### Buttons
- **Primary:** pill, Honey Brass fill, Bone text, 14px/24px padding, no border, no shadow. Hover: background darkens (`color-mix` with Ink 18%). Press: `scale(0.98)`. Transitions 200 to 250ms.
- **Secondary (ghost):** pill, transparent, 1.5px solid currentColor. Hover: fills with the surface's text colour at 8%. Used on dark surfaces and over imagery, and as the light-surface counterpart.
- **Text link with arrow:** no container, 1.5px underline, trailing `→`.

### Specimen Tag
Outlined pill (1.5px currentColor), DM Mono, 6px/10px padding. The "label on the sample jar": lot codes (`L…`), harvest years, step numbers, analysis figures. Never filled, never a button.

### Badge
Honey Brass Tint fill, Night Grove text, pill, DM Mono 500 0.75rem. For short functional emphasis ("In corso", "Novità") only.

### Cards
`card` radius, Soft Ivory fill on parchment (or a Bone 6% fill with a Bone 16% hairline on grove), 16 to 24px padding, no shadow, no border on light surfaces.

### Disclosure panel ("Informazioni di legge")
Native `<details>`/`<summary>`. Summary is a full-width row with a mono label and a `+` that rotates to `×`. Content is a two-column definition list (label / value + normative reference in specimen style). Used wherever mandatory or normative detail would otherwise crowd the narrative.

### Navigation
Sticky, Warm Parchment at 92% with a hairline bottom border (no blur glass, no shadow). Mono label links; a single Honey indicator line slides to the active link. Mobile: full-screen Night Grove overlay.

### Photography
`ImagePlaceholder` frames: `card` radius, no shadow, hover scales the image 1.03 inside the frame. Product cutouts float without a frame and without drop-shadow.

### Territorio Scroll Reveal (signature)
Unchanged mechanics: pinned sequence, real province silhouette mask, two markers, photo crossfade. Only the skin follows this file (flat callouts, whisper type).

## Do's and Don'ts

### Do
- Author scroll-linked motion with explicit longhands plus `@supports not (animation-timeline: ...)` fallback.
- Use specimen tags for any code, date or figure a consumer might check against a label.
- Keep normative detail available but folded (disclosure panel), the narrative first.
- Keep copy verifiable: no claim the farm cannot document (no organoleptic or chemical claims without that year's analysis, no generic environmental claims).

### Don't
- Don't add any shadow, glow or decorative gradient.
- Don't use weight 600+ on headlines, or a sans-serif display face.
- Don't put two Night Grove sections next to each other.
- Don't introduce Seed's lime or any third accent hue.
- Don't use em dashes in shipped copy or headings.
- Don't introduce Tailwind, Motion/Framer or GSAP.
