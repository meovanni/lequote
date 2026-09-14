---
name: Le Quote
description: Brochure site for a family farm spanning two Abruzzo elevations, told through a quiet warm-neutral canvas, one honey accent, and a real-geography scroll reveal.
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
    fontWeight: 560
    lineHeight: 0.98
    letterSpacing: "-0.01em"
    fontVariation: "'opsz' 144, 'SOFT' 15"
  headline:
    fontFamily: "'Fraunces Variable', 'Fraunces', 'Iowan Old Style', Georgia, serif"
    fontSize: "clamp(2rem, 3.2vw + 1rem, 3.25rem)"
    fontWeight: 540
    lineHeight: 1.08
    letterSpacing: "-0.005em"
    fontVariation: "'opsz' 96, 'SOFT' 10"
  title:
    fontFamily: "'Fraunces Variable', 'Fraunces', 'Iowan Old Style', Georgia, serif"
    fontSize: "clamp(1.5rem, 2vw + 1rem, 2.25rem)"
    fontWeight: 520
    lineHeight: 1.15
    fontVariation: "'opsz' 72, 'SOFT' 8"
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
  sm: "6px"
  md: "12px"
  lg: "22px"
  button: "10px"
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
components:
  button-primary:
    backgroundColor: "{colors.honey-brass}"
    textColor: "{colors.bone}"
    rounded: "{rounded.button}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.warm-parchment}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
---

# Design System: Le Quote

## Overview

**Creative North Star: "Il Registro del Frantoio" (The Frantoio Ledger)**

The system reads like a farm's own record book, not a marketing brochure: precise, unhurried, and grounded in specific facts rather than adjectives. A warm-parchment canvas carries most of the site; one honey-brass accent is spent deliberately, the way a ledger uses red ink, only where it marks an action or a place. Nothing glows, nothing floats without reason, and the two products (oil, honey) never compete visually with the two places that produce them. The site's single most expressive gesture, the Territorio scroll-reveal, is itself built from a real geographic silhouette rather than an invented shape, in keeping with the ledger's commitment to fact over flourish.

Confirmed rejections: no Tailwind, no animation library (Motion/Framer/GSAP), no AI-purple or glass-panel decoration, no generic three-card feature grids, no em dashes in shipped copy or headings.

**Key Characteristics:**
- Warm-neutral canvas (parchment/ivory) with exactly one spent-sparingly accent color, not a rotating palette.
- A dark surface (night-grove) reserved for precisely two sections, marking a shift in register rather than a "dark mode."
- Motion is scroll-driven and structural (reveals, a pinned map sequence), never decorative or idle.
- Flat-by-default surfaces; a shadow only appears as a state response or on genuinely floating content.
- Typography does the emotional work the palette deliberately withholds: one serif display family carries all warmth and personality.

## Colors

A near-monochrome warm-neutral field with two functional accents pulled directly from the product (honey, olive) and one dark register reserved for closing moments.

### Primary
- **Aged Honey Brass** (#9c6530): the site's one call-to-action and wayfinding color — primary buttons, the nav's active-link indicator, Territorio's map-marker dots. If something is clickable or marks "you are here," it is this color; nothing else claims that job.

### Secondary
- **Deep Olive Leaf** (#4c5735): structural accent, not interactive — the Olio section's variety-list rule, ambient radial tints behind a couple of sections. Reads as "context," never as an action.

### Neutral
- **Warm Parchment** (#f7f3e8): primary light background, most sections.
- **Soft Ivory** (#efe7d4): secondary light background, used to alternate rhythm between adjoining sections.
- **Night Grove** (#1c2417): near-black warm green, background for exactly Shop and Footer — text is Bone against it.
- **Deep Ink Blue** (#233142): primary text and icon color on light surfaces (also the logo's ink).
- **Bone** (#f3eedf): primary text color on Night Grove.

### Named Rules
**The Two-Accent Discipline Rule.** Honey Brass is the only interactive/wayfinding color; Olive Leaf is the only non-interactive structural accent. They never share a job, and a third accent hue is never introduced without revising this file — the "same land, two elevations" premise depends on the palette staying this small.

## Typography

**Display Font:** Fraunces Variable (with Iowan Old Style, Georgia, serif fallback)
**Body Font:** Instrument Sans Variable (with Instrument Sans, sans-serif fallback)
**Label/Mono Font:** DM Mono (with ui-monospace, monospace fallback)

**Character:** A warm, optically-tuned serif carries every headline and title (softness and optical size shift per role via variable-font axes, never a second serif family); a neutral humanist sans carries reading text; a mono face marks anything functional — labels, nav, figures, eyebrows — in uppercase with wide tracking, standing in for "the metadata line" of the ledger.

### Hierarchy
- **Display** (weight 560, `clamp(2.75rem, 6vw + 1rem, 6rem)`, line-height 0.98): hero headline only.
- **Headline** (weight 540, `clamp(2rem, 3.2vw + 1rem, 3.25rem)`, line-height 1.08): section titles (Chi siamo, Territorio, Olio, Miele).
- **Title** (weight 520, `clamp(1.5rem, 2vw + 1rem, 2.25rem)`, line-height 1.15): product subtitles.
- **Card title** (weight 540, `clamp(1.25rem, 1vw + 1rem, 1.5rem)`, line-height 1.2): smallest display step, for card- and marker-level titles (e.g. Territorio's place names).
- **Body** (weight 400, `clamp(1rem, 0.3vw + 0.95rem, 1.0625rem)`, line-height 1.65): running copy. A `body-lead` variant (1.25rem/1.75) exists for section intros; `body-sm` (0.875rem/1.5, weight 500) for captions and card notes.
- **Label** (weight 500, 0.8125rem, letter-spacing 0.1em, uppercase): nav links, buttons, figures. An `eyebrow` variant tightens to 0.75–0.8125rem with wider tracking (0.14em) for kickers above titles.

### Named Rules
**The One-Serif Rule.** Every display need (hero, headline, title, card title) is Fraunces at a different point on its own variable axes, never a second serif introduced for contrast. Emphasis inside a headline uses italic or heavier weight of the same face, not a mixed family.

## Layout

Full-viewport (`100svh`) sections stacked vertically, each carrying `scroll-snap-align: start` and `scroll-snap-stop: always` against a site-wide `scroll-snap-type: y mandatory` — one scroll gesture reliably advances exactly one section. Content is capped at `max-width: 1240px`, centered, with responsive inline padding `clamp(1.25rem, 4vw, 3rem)`. Spacing follows a 4px-rooted scale (4 / 8 / 12 / 16 / 24 / 32 / 48 / 80px) used consistently for gaps, padding, and section rhythm. Breakpoints are literal values repeated per stylesheet rather than custom-property-driven: 480 / 768 / 1024 / 1280px. The Territorio section is the one deliberate exception to one-section-per-viewport: it pins for an extended scroll distance (580vh) to host a multi-stage sequence, using invisible intermediate snap points so the mandatory site-wide snap behavior still advances in small, controlled steps through it.

## Elevation & Depth

Flat by default. No section or card carries a shadow at rest. A shadow appears only as a state response (photo hover-lift) or to mark content that is genuinely floating above the page (Territorio's map-marker callout cards) — never as ambient decoration. Photographic elements (the hero logo mark, product bottle cutouts, the Territorio mask edge) use `filter: drop-shadow(...)` rather than `box-shadow`, a deliberately separate "photographic depth" vocabulary from the flatter "UI depth" used elsewhere.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 24px 70px -32px rgba(28, 36, 23, 0.32)`): the one UI shadow in the system. Used on Territorio's marker cards at rest (they are genuinely floating) and on `ImagePlaceholder` photos on hover only.

### Named Rules
**The Flat-Until-Floating Rule.** A shadow is either a hover response or a signal that the element is a floating overlay, never a resting-state decoration on a primary surface.

## Shapes

Soft-but-squared: corners are always rounded, never sharp, but never pill-shaped except where the shape itself signals "interactive chip." Radius scale: `sm` 6px (small cards, marker callouts), `md` 12px (medium containers, video-fallback placeholder), `lg` 22px (`ImagePlaceholder` photo frames — the largest radius in the system, reserved for photography), `button` 10px (its own step, dedicated to CTAs, distinct from card radii), `pill` 999px (reserved exclusively for interactive or informational chips: the nav's active-link underline track, the photo-caption chip — never used on a card or a photo frame).

## Components

### Buttons
- **Shape:** `button` radius (10px).
- **Primary:** Honey Brass background (#9c6530), Bone text (#f3eedf), padding `12px 24px`. Signature gesture: a diagonal white-gradient "sheen" sweeps across on hover (`translateX(-120%)` to `translateX(120%)`, 0.6s), combined with a 2px lift and a warm-tinted shadow; press state scales to 0.97. This exact combination (sheen + lift + press) is the site's one recurring tactile signature and appears on every primary CTA.
- **Secondary:** transparent background, 1px border in the surface's border token, Ink text. Hover tints the background with Honey Brass Tint at 14% opacity and lifts 2px; no sheen (sheen is primary-only).

### Cards
- **Corner Style:** `sm` radius (6px).
- **Background:** Warm Parchment (the section's light surface token).
- **Shadow Strategy:** Card shadow at rest (see Elevation & Depth) — this is the one component allowed a resting shadow, because it is a floating callout, not a page surface.
- **Border:** 1px, the surface's border token.
- **Internal Padding:** `12px 16px` (space-3 / space-4).
- Positions itself to either side of its anchor (left or right) depending which keeps it inside the frame; collapses to a centered position below the anchor under 640px rather than risking viewport overflow.

### Navigation
- **Style:** sticky, frosted glass (`backdrop-filter: blur(16px) saturate(160%)` over Warm Parchment at 68% opacity), hairline bottom border.
- **Typography:** Label scale, lowercase (not the uppercase eyebrow variant).
- **States:** a single indicator line (Honey Brass at 70% opacity, `pill` radius) slides between links to mark the active one — one shared element in motion, not per-link highlight boxes. The nav's shadow/border only intensify after the page has scrolled (a `navScrolled` state), staying invisible at the top of the page.
- **Mobile:** collapses to a full-screen Night Grove overlay with Bone text links, opened by a 44×44px minimum-hit-area menu button.

### Photography (signature primitive)
- **Style:** `ImagePlaceholder` is the site's recurring image frame — `lg` radius, a thin accent-tinted border, and (for placeholder states without a real photo yet) a diagonal hairline texture over a dark gradient. Real photos hover-lift 4px and reveal the Card shadow; a small pill-shaped caption chip (dark, blurred background, Bone text) can overlay the bottom edge.

### Territorio Scroll Reveal (signature component)
A pinned, multi-stage sequence built from the region's real geographic silhouette (not a stylized icon): the mask grows from a small starting size to a fixed "diagram" size using native scroll-driven animation, then two location markers activate in sequence, each opening a Card-style callout, while the underlying photo crossfades from the coastal to the mountain site. This is the system's one bespoke, non-template asset and the clearest expression of the North Star: it treats real geography as content, not decoration.

## Do's and Don'ts

### Do:
- **Do** author scroll-linked motion with explicit longhand (`animation-name`, `animation-duration: 1ms`, `animation-timing-function`, `animation-fill-mode`, `animation-timeline`, `animation-range`) plus an `@supports not (animation-timeline: ...)` fallback — the `animation: name linear both` shorthand silently breaks in engines that default duration to `0s`.
- **Do** keep Night Grove confined to exactly Shop and Footer; it marks a "closing" register, not a general dark mode.
- **Do** give every primary CTA the sheen + lift + press pattern so buttons feel like one family.
- **Do** reserve `pill` radius for interactive or informational chips only.

### Don't:
- **Don't** introduce Tailwind, Motion/Framer, or GSAP. The native-CSS, zero-animation-library architecture is deliberate and load-bearing — a hand-built JS fallback already exists for browsers without native scroll-driven animation support, and a library would fight it rather than replace it.
- **Don't** use em dashes in shipped copy or headings.
- **Don't** add a shadow at rest to a primary page surface; Card shadow is a hover/floating-state signal only.
- **Don't** introduce a third accent hue, or a second dark surface, without revising this file — the two-accent, one-dark-register discipline is the whole visual argument for "same land, two elevations."
