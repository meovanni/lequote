---
name: Le Quote
description: Brochure and (soon) shop for a family farm spanning two Abruzzo elevations, told through a white, near-colourless canvas with the logo's ink blue as the only accent, whisper-weight serif headlines, and a real-geography scroll reveal.
colors:
  white: "#fcfcfb"
  mist: "#f2f2ef"
  hairline: "#e3e3df"
  ink: "#233142"
  ink-deep: "#18222e"
  graphite: "#8a919a"
  night: "#161b21"
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
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
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
    backgroundColor: "{colors.mist}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px"
---

# Design System: Le Quote

## Overview

**Creative North Star: "Il Registro sotto vetro" (The Ledger Under Glass)**

The farm's own record book, set out like a specimen under laboratory glass. The system keeps the original ledger idea (precise, unhurried, fact over adjective) and adopts the restraint of a botanical-clinical reference (Seed): whisper-weight headlines, perfectly flat surfaces, pill-shaped controls, mono "specimen labels" for codes and dates, and a calm alternation between two near-white bands. Credibility comes from typographic confidence and chromatic silence, not visual volume. This matters more now that the site carries legally-relevant traceability content: it must read as a reference, not an advert.

What stays Le Quote, not Seed: the logo's ink blue as the one colour, the one serif family (Fraunces), and the Territorio signature reveal. Seed's lime accent and its sans-serif display voice are deliberately not adopted.

Confirmed rejections: no Tailwind, no animation library (Motion/Framer/GSAP; three.js with React Three Fiber and @react-three/postprocessing are allowed for the Territorio diorama only), no box-shadows or drop-shadows, no decorative gradients (a functional legibility scrim over video/photo is the single exception), no AI-purple or glass-panel decoration, no generic three-card feature grids, no em dashes in shipped copy or headings.

**Key Characteristics:**
- White canvas alternating with Mist bands as page rhythm; Night only under the hero photo.
- One accent, the logo's Ink, for every interactive element; Graphite for structural marks.
- No olive green or honey tone in the interface: those colours belong to the product (bottle, jar), not to the chrome.
- Whisper-weight Fraunces (300 to 380) for every display role.
- Flat, shadowless surfaces; hierarchy from colour contrast, weight and space only.
- Pills for every button, badge and tag; 16px cards; 32px large containers.
- Mono specimen tags (DM Mono, outlined pill) for lot codes, harvest years, step numbers, analysis figures.

## Colors

### Accent
- **Ink** (#233142): the logo's ink. Text on light surfaces and the one interactive colour: primary buttons, active nav indicator, map markers, focus ring, selected states.
- **Ink Deep** (#18222e): hover/pressed tone of Ink where a darker step is needed.

### Neutral
- **White** (#fcfcfb): primary surface.
- **Mist** (#f2f2ef): alternate band surface and card fill on White.
- **Hairline** (#e3e3df): rules and borders on White (#d9d9d4 on Mist).
- **Graphite** (#8a919a): structural, never interactive: timeline bars, small markers.
- **Night** (#161b21): only under the hero photo and the scrim; White text on it.
- **Error Brick** (#a8402c, tint #e2836a on Night): form validation only.

The legacy token names (`--color-pergamena`, `--color-miele`, `--color-oliva`, `--color-bosco`…) remain as aliases of the neutrals above so older stylesheets keep working; new code uses the new names or the `--surface-*` tokens.

### Named Rules
**The Single-Ink Rule.** Ink is the only accent. Product colours (olive green, honey amber) appear only in the product illustrations, photos and the Territorio diorama, never in the interface chrome.

**The Rhythm Rule.** Sections alternate White and Mist at full bleed; the hero is the only dark band.

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
**The Whisper Rule.** Display roles stay between 300 and 380. On Night or over video, every display role sits at the top of the range (380) for legibility. Never 600+ on a headline.

**The One-Serif Rule.** Every display need is Fraunces on its own axes (opsz per role, SOFT 0 for the crisper reference voice). Emphasis inside a headline is italic, not weight.

## Layout

Full-viewport (`100svh`) sections with `scroll-snap-align: start` against site-wide `scroll-snap-type: y mandatory` on mouse devices only. Touch, hover-less and narrow (≤1024px) devices get fully native scrolling: no snap, no scroll-driven animation, no pinned sequence (Territorio becomes a static map plus the two place cards). On WebKit, fast inertial scrolling with a direction change made the page jump elsewhere. The query lives in `client/src/lib/nativeScroll.ts` and is repeated in the stylesheets. Content max-width 1240px, inline padding `clamp(1.25rem, 4vw, 3rem)`. Spacing on a 4/8px scale up to 128px; section vertical padding at least 80px. Content sections use asymmetric two-column splits (roughly 40/60), not equal columns. Breakpoints are literal values per stylesheet: 480 / 768 / 1024 / 1280px. Territorio remains the one pinned multi-stage exception (340vh, desktop only).

Section order and surfaces: Hero (dark, video/photo) · Territorio (white, 3D diorama) · Olio (mist) · Miele (white) · Filiera (mist) · Stagioni (white) · Shop (mist) · Domande (white) · Footer (mist).

## Elevation & Depth

None. The system is shadowless: no box-shadow, no drop-shadow, no glow. Hierarchy comes from surface contrast (Mist card on White, White card on Mist, hairlines), weight, and space. A floating callout (Territorio markers) is distinguished by a solid surface fill and a 1.5px hairline, not a shadow. The only gradient allowed is a functional dark scrim over the hero video/photo so White text stays legible.

## Shapes

`sm` 8px (inputs, small inner elements), `card` 16px (cards, photo frames, panels), `lg` 32px (large containers, the hero media frame on wide screens), `pill` 999px (every button, badge, tag, chip). Square or 4 to 10px corners on buttons are not allowed.

## Components

### Buttons
- **Primary:** pill, Ink fill, White text, 14px/24px padding, no border, no shadow. Hover: background darkens (`color-mix` with Ink 18%). Press: `scale(0.98)`. Transitions 200 to 250ms.
- **Secondary (ghost):** pill, transparent, 1.5px solid currentColor. Hover: fills with the surface's text colour at 8%. Used on dark surfaces and over imagery, and as the light-surface counterpart.
- **Text link with arrow:** no container, 1.5px underline, trailing `→`.

### Specimen Tag
Outlined pill (1.5px currentColor), DM Mono, 6px/10px padding. The "label on the sample jar": lot codes (`L…`), harvest years, step numbers, analysis figures. Never filled, never a button.

### Badge
Ink fill, White text, pill, DM Mono 500 0.75rem. For short functional emphasis ("In corso", "Novità") only.

### Cards
`card` radius, Mist fill on White, White fill on Mist, 16 to 24px padding, no shadow, no border on light surfaces.

### Disclosure panel ("Informazioni di legge")
Native `<details>`/`<summary>`. Summary is a full-width row with a mono label and a `+` that rotates to `×`. Content is a two-column definition list (label / value + normative reference in specimen style). Used wherever mandatory or normative detail would otherwise crowd the narrative.

### Navigation
Sticky, White at 94% with a hairline bottom border (no blur glass, no shadow). Mono label links; a single Ink indicator line slides to the active link. Mobile: full-screen White overlay with Ink links.

### Photography
`ImagePlaceholder` frames: `card` radius, no shadow, hover scales the image 1.03 inside the frame. While a photo is missing: a neutral dashed frame with a camera icon and "Foto in arrivo", never the shot description in the layout. Product cutouts float without a frame and without drop-shadow.

### Territorio diorama (signature)
One full-screen "slide" (replaces the old Chi siamo and Territorio sections), in the style of BUCK's Airbnb miniatures: Abruzzo as a photographed tabletop model that rises out of a seamless white floor (the page White) and fades into it at the region border, with no walls or frame. Real elevation (3x exaggerated) with natural, softened colours: patchwork fields, olive groves, beech woods, pastures, rock and pale summits, the Adriatic as pale water with small moving glints. Light is baked offline (low sun from SSE, soft shadows, valley occlusion, contact shadows) into one texture; miniature trees (round beeches, low olives), a farmhouse at Roseto and coloured hives at Cerchio sit on top; thin mist breathes over the peaks. Post: tilt-shift blur, light vignette, faint grain. Camera: seen from far and above (about 42 degrees), one straight dolly from a wide shot over Roseto to a closer shot over Cerchio, eased in and out, never turning back. Desktop: pinned (340vh), scroll drives it with heavy damping; phones keep native scroll and play it once (8 s). Text beats sit on light cards. Reduced motion or no WebGL: the midpoint view, both places visible, every text below. Data and bake: `client/scripts/terrain/build_abruzzo.py` writes `client/public/terrain`; three.js and the effects load lazily near the section. Interface colours stay neutral; the diorama is the one place with landscape colour.

## Do's and Don'ts

### Do
- Author scroll-linked motion with explicit longhands plus `@supports not (animation-timeline: ...)` fallback.
- Use specimen tags for any code, date or figure a consumer might check against a label.
- Keep normative detail available but folded (disclosure panel), the narrative first.
- Keep copy verifiable: no claim the farm cannot document (no organoleptic or chemical claims without that year's analysis, no generic environmental claims).

### Don't
- Don't add any shadow, glow or decorative gradient.
- Don't use weight 600+ on headlines, or a sans-serif display face.
- Don't bring olive green or honey amber back into the interface.
- Don't introduce Seed's lime or any second accent hue.
- Don't use em dashes in shipped copy or headings.
- Don't introduce Tailwind, Motion/Framer or GSAP.
