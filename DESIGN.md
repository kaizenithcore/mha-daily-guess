---
name: MHAdle
description: Daily My Hero Academia guessing game, drawn as Izuku's hero-analysis notebook.
colors:
  paper: "#eef1f5"
  sheet: "#f8fafc"
  grid: "#cdd8e6"
  ink: "#1c2330"
  ink-soft: "#4a5466"
  pen: "#2b55a6"
  redpen: "#c42f27"
  hl-green: "#b8f29a"
  hl-yellow: "#fbe36b"
  desk: "#c9d1dc"
  border: "#b4c2d4"
typography:
  display:
    fontFamily: "Permanent Marker, Comic Sans MS, cursive"
    fontSize: "clamp(3rem, 14vw, 4.75rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Permanent Marker, Comic Sans MS, cursive"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.01em"
  title:
    fontFamily: "Permanent Marker, Comic Sans MS, cursive"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.01em"
  hand:
    fontFamily: "Kalam, Segoe Print, cursive"
    fontSize: "1.02rem"
    fontWeight: 700
    lineHeight: 1.2
  hand-note:
    fontFamily: "Kalam, Segoe Print, cursive"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.375
  hand-input:
    fontFamily: "Kalam, Segoe Print, cursive"
    fontSize: "1.35rem"
    fontWeight: 700
  label:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 600
    letterSpacing: "0.08em"
    fontFeature: "tnum"
  label-field:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, system-ui, sans-serif"
    fontSize: "0.66rem"
    fontWeight: 700
    letterSpacing: "0.08em"
    fontFeature: "tnum"
  button:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 700
    letterSpacing: "0.05em"
  stamp:
    fontFamily: "Permanent Marker, Comic Sans MS, cursive"
    fontSize: "1.15rem"
    fontWeight: 400
    letterSpacing: "0.04em"
rounded:
  page: "0.2rem"
  base: "0.25rem"
  tab: "0.5rem"
spacing:
  grid-cell: "22px"
  margin-rule: "3.25rem"
  page-inset: "4.5rem"
  spread-gutter: "4.5rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
    typography: "{typography.button}"
    rounded: "{rounded.page}"
    padding: "0.55rem 1.1rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "#2a3447"
    textColor: "{colors.sheet}"
  link:
    textColor: "{colors.pen}"
    typography: "{typography.hand}"
    height: "2.25rem"
  link-hover:
    textColor: "{colors.ink}"
  link-red:
    textColor: "{colors.redpen}"
    typography: "{typography.hand}"
  tab:
    backgroundColor: "#dfe6ef"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.tab}"
    padding: "0.4rem 0.35rem 0.3rem"
    height: "2.75rem"
  tab-selected:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
  tab-toggle-on:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
  writeline-input:
    textColor: "{colors.pen}"
    typography: "{typography.hand-input}"
    padding: "0.55rem 0.15rem 0.4rem"
  sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
  entry:
    backgroundColor: "{colors.sheet}"
    padding: "0.9rem 0.85rem 0.85rem"
  field-label:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label-field}"
  field-value:
    textColor: "{colors.ink}"
    typography: "{typography.hand}"
  postit:
    backgroundColor: "#dff1fb"
    textColor: "{colors.ink}"
    padding: "0.75rem 0.85rem 0.8rem"
  stamp:
    textColor: "{colors.redpen}"
    typography: "{typography.stamp}"
    padding: "0.15rem 0.6rem"
---

# Design System: MHAdle

## Overview

**Creative North Star: "Deku's Analysis Notebook"**

Guessing is analysis. Every surface is a page of Izuku's "Análisis de héroes para el futuro" notebook: cool graph paper, navy ballpoint, a blue gel pen for everything written by hand, a red pen that strikes what is wrong, and two highlighters that mark what matched and what came close. Today's case is taped into the notebook as a polaroid, the game modes are card-stock index tabs on the page edge, hints are post-its, and the closing verdict is a rubber stamp.

The system has three voices, and each one means something. Marker (Permanent Marker) is the heading voice of a student writing titles in thick felt-tip. Handwriting (Kalam) is everything the player or Izuku writes: names, values, notes, links. Print (Barlow Semi Condensed, uppercase, tabular numerals) is the notebook's own pre-printed furniture: form labels, counters, field names. Content is never printed. Furniture is never handwritten.

Density is phone-first: on a 390px screen the phone *is* the page, gridded edge to edge. From 720px the page lies on a desk with a red margin rule and punched holes, and from 1100px it opens into a two-page spread with the case on the left leaf and the analysis on the right. The build rejects the category's dark panel of coloured tiles under a logo, and it replaced the earlier navy/gold "U.A. HUD" look completely.

**Key Characteristics:**
- Cool graph paper ground (never cream), 22px grid in 1px lines.
- Three type voices with fixed jobs: marker headings, handwritten content, printed furniture.
- Verdicts are marks a student would make (highlighter, wavy underline, strike), legible without colour.
- Real-stationery materials only: tape, polaroid, post-its, index tabs, stamp, marker circle.
- One signature motion: ink writes in, then the marks land.

## Colors

A cool, low-chroma paper-and-ink palette where colour is reserved for the instruments that annotate: pen, red pen, two highlighters.

### Primary
- **Navy Ballpoint** (ink): body text, headings, the primary button fill, the writing line's rule. It is the notebook's default ink and the only near-black.
- **Blue Gel Pen** (pen): all handwriting the player reads as "written": subtitle, field fill-ins, the search input, links, countdown, stats, ↑/↓ arrows, focus rings and the input caret.

### Secondary
- **Red Pen** (redpen): strikes misses, circles the solved name, inks the "¡Plus Ultra!" stamp, the margin rules (at 55% mix), destructive links ("Me rindo, revela el héroe").

### Tertiary
- **Match Highlighter** (hl-green): the background swipe behind a matched value. Never text, never a fill for UI chrome.
- **Close Highlighter** (hl-yellow): the swipe behind a close value, the title's "MHA" highlight and text selection.

### Neutral
- **Graph Paper** (paper): the page ground, and the body on phones.
- **Fresh Sheet** (sheet): sheets laid on the page (case block, analysis sheet, closing card, dropdown), the selected tab, button text.
- **Grid Line** (grid): the 1px graph lines.
- **Faded Pencil** (ink-soft): printed labels, field names, aliases, struck-out values, placeholder (at 80%).
- **Desk** (desk): the surface the notebook lies on at 720px and up; also shows through the punched holes.
- **Sheet Edge** (border): 1px sheet borders, dashed entry separators, locked post-it outlines, tab edges.

### Named Rules
**The Instruments Rule.** Colour is an instrument, not decoration: blue means written, red means wrong or closed, green means match, yellow means close. Do not use any of them for any other meaning; the one exception is the printed red margin rule, which is part of the paper itself.

**The Cool Paper Rule.** The ground is cool blue-grey paper. Warm cream or beige grounds are off-system; the only warm tone is the masking tape itself.

## Typography

**Display Font:** Permanent Marker (with Comic Sans MS, cursive)
**Body Font:** Kalam 400/700 (with Segoe Print, cursive)
**Label/Data Font:** Barlow Semi Condensed 500/600/700 (with Arial Narrow, system-ui), tabular numerals set globally

**Character:** A felt-tip marker for titles, a neat student hand for content, and a condensed print face for the notebook's pre-printed form. The contrast between hand and print is what makes the page read as a filled-in notebook.

### Hierarchy
- **Display** (400, clamp(3rem, 14vw, 4.75rem), 0.95): the "MHAdle" title only, with "MHA" under a yellow highlighter band (52% to 90% of the line).
- **Headline** (400, 1.875rem, 2.25rem from 640px, 1): the case heading ("¿Quién es?") and the solved name.
- **Title** (400, 1.5rem, 1): section headings ("Análisis", "Pistas").
- **Hand** (700, 1.02rem, 1.2): attempt field values; names in entries and search results at 1.125–1.25rem.
- **Hand note** (400, 1rem–1.125rem, ~1.375): subtitles, prompts, post-it bodies, footer note. Quotes in Cita mode go to 1.5–1.7rem bold.
- **Hand input** (700, 1.35rem): the search writing line; placeholder drops to 400.
- **Label** (600, 0.72rem, 0.08em, uppercase): printed form labels and counters ("Análisis Nº", "Tu respuesta", "Intento 3", "2 intentos").
- **Field label** (700, 0.66rem, 0.08em, uppercase): attribute names in entries ("Género", "Altura").
- **Button / Tab** (700, 0.95rem / 0.8rem to 0.875rem, 0.05em / 0.02em to 0.04em, uppercase): printed controls.

### Named Rules
**The Three Voices Rule.** Marker for headings, Kalam for anything written, Barlow for anything printed. A value the game reports about a character is written (Kalam); the name of the field it fills is printed (Barlow).

**The Printed Blank Rule.** A printed label always names a field, counter or state that sits beside or after it ("Análisis Nº 169", "Próximo héroe en 16:27:42"). It is never a decorative kicker above a heading.

## Layout

Single column, phone-first, built from Tailwind spacing on top of a 22px graph grid.

- **Below 720px:** the body itself carries the graph paper; the content column is the full screen width with 1rem side padding (1.5rem from 640px). No desk, no margin rule, no holes.
- **720px and up:** the `main` becomes the notebook page (max 44rem), floating on the desk with 2rem top and bottom margins. A printed red margin rule runs at 3.25rem; punched holes (0.8rem diameter, every 5.5rem, starting 2.5rem down) sit at 0.9rem from the binding edge and show the desk through. Content starts at 4.5rem from the left edge.
- **1100px and up:** the page widens to 72rem (6xl) and becomes a two-page spread: two equal columns, 4.5rem gutter. The left leaf holds header, tabs, case, conclusion and hints; the right leaf holds the analysis and spans the rows. A binding gutter line with a soft inner shadow and the right leaf's own margin rule run full page height. An empty right leaf carries the handwritten placeholder "Aquí irán tus análisis."; that placeholder is spread-only.
- **Below 1100px:** order is header, tabs + case, conclusion, analysis, hints.
- **Attempt entries** use a container query on the analysis sheet: 4 columns by default (affiliation spans 2); from a 44rem container, one row of 7 with affiliation at 1.8fr.
- **Hints** go two-up from 640px.
- **Tabs** drop their icons below 480px and keep labels.

## Elevation & Depth

Depth is physical: paper on paper on a desk. Shadows are soft, low, navy-tinted (rgb 28 35 48) and always read as something resting on something else. There are no glows and no coloured shadows.

### Shadow Vocabulary
- **Sheet** (`box-shadow: 0 1px 0 rgb(28 35 48 / 0.04), 0 10px 24px -18px rgb(28 35 48 / 0.35)`): a sheet laid on the page.
- **Page on desk** (`box-shadow: 0 1px 0 rgb(28 35 48 / 0.06), 0 24px 48px -28px rgb(28 35 48 / 0.55), 4px 4px 0 -1px var(--paper), 4px 4px 0 0 rgb(28 35 48 / 0.12)`): the notebook page; the last two layers draw the leaf beneath it in paper colour, not a graphic offset shadow.
- **Post-it** (`box-shadow: 0 1px 1px rgb(28 35 48 / 0.06), 0 8px 14px -10px rgb(28 35 48 / 0.35)`): a sticky note lifting at its free edge.
- **Polaroid** (`box-shadow: 0 8px 16px -10px rgb(28 35 48 / 0.55)`): the taped photo.
- **Button** (`box-shadow: 0 6px 14px -10px rgb(28 35 48 / 0.7)`): the primary button.
- **Tape** (`filter: drop-shadow(0 1px 1px rgb(28 35 48 / 0.12))`): masking tape.

### Named Rules
**The Resting Object Rule.** Every shadow belongs to an object that could lie on a desk. If you cannot name the object, it gets no shadow.

**The Under-Leaf Exception.** The 4px offset layer exists only on the notebook page, in paper colour, to show the next leaf. It is never reused as a hard offset shadow on cards, buttons or tabs.

## Shapes

Paper is square-cornered. The page (0.2rem) and buttons (0.2rem) are barely softened; legacy panels use 0.25rem. Index tabs are the one rounded silhouette: 0.5rem top corners, flat bottom, sitting 3px low until selected or hovered. Hand-drawn forms are irregular on purpose: the name circle uses asymmetric radii (50% 45% 52% 48% / 55% 48% 52% 45%) rotated -3deg; the stamp uses 46% 54% 42% 58% / 22% 30% 26% 34% rotated -6deg. Small tilts carry the handmade feel: polaroid -2deg, tape ±3 to 6deg, open post-its alternate -0.8deg and 0.9deg. Separators inside a sheet are dashed (entries, search results); sheet outlines are solid 1px.

## Components

### Buttons
Printed, heavy and few. One primary action per closed case.
- **Shape:** near-square (0.2rem), min height 2.75rem.
- **Primary:** navy ballpoint fill, fresh-sheet text, uppercase Barlow 700 at 0.95rem, padding 0.55rem 1.1rem, optional 1rem leading icon.
- **Hover / Focus:** fill lifts to #2a3447; active presses down 1px (140ms, cubic-bezier(0.16, 1, 0.3, 1)); focus is a 2px blue-pen outline at 3px offset.
- **Disabled:** 45% opacity, not-allowed cursor.

### Links
Handwritten actions: Kalam 700 at 1rem, blue pen, 1px underline at 0.22em offset, min height 2.25rem, optional leading icon. Hover turns to navy ink. The red variant is reserved for giving up. Same focus ring as buttons.

### Index Tabs (game modes)
Card-stock tabs on the sheet's top edge, a 4-column grid with 0.25rem gaps, overlapping the sheet by 1px.
- **Stock:** each tab has its own card colour: Clásico #cfe0f5 (strong edge pen), Silueta #d9d6ec (strong edge #4b3f8f), Cita #f6d5dc (strong edge redpen), Infinito #d6ecd0.
- **Default:** faded-pencil uppercase Barlow 700, translated 3px down. Hover raises it to 0 and inks the label.
- **Selected:** becomes the sheet (fresh-sheet fill, ink text), flush, with a 4px inset top edge in its strong colour.
- **Toggle (Infinito):** a pressed toggle fills navy with sheet text.

### Writing Line (search)
The ruled line the player writes on: a pen-line icon, then a borderless Kalam 700 input at 1.35rem in blue pen, over a 2px navy rule that turns blue on focus-within (160ms). Results drop in a sheet with dashed dividers, a 2.5rem photo square and the name in Kalam.

### Analysis Entries (attempts)
A single sheet, newest entry first, entries separated by a dashed line. Each entry has a 2.75rem photo square, the name in Kalam 1.25rem, alias in « », and the attempt number "#n" handwritten in faded pencil. Below, a definition list of the seven attributes: printed field label, handwritten value with its verdict mark. The grid is container-queried (see Layout). A printed key under the sheet repeats the three marks and the arrow in Spanish ("coincide", "cerca", "no coincide", "el héroe tiene más").

### Verdict Marks (signature)
The three verdicts are marks a student makes, and each survives greyscale on its own:
- **Match:** green highlighter swipe behind the value (slightly slanted ends).
- **Close:** yellow highlighter swipe plus a 1px wavy underline in ink at 55%, 0.25em offset.
- **Miss:** value drops to faded pencil and gets a 2px red-pen strike-through.
- **Direction:** a blue-pen ↑ or ↓ arrow (2.5 stroke) after numeric values, each with a Spanish label ("más", "menos"). Every mark also carries a screen-reader verdict.

### Polaroid
The case subject: a white instant-photo frame (0.375rem padding, 1.25rem bottom lip) tilted -2deg, taped at the top centre, holding a 6–7rem photo slot and a handwritten caption ("sujeto nº ?", "¡identificado!"). In Silueta mode the photo sharpens per attempt.

### Masking Tape
An SVG strip (4.5rem × 1.3rem) with torn ends and paper fibre, warm off-white at 88% opacity. Pinned to the polaroid and to both top corners of the closing card at small opposing angles.

### Post-its (hints)
Square sticky notes in a three-colour rotation (#dff1fb, #fde2ea, #e6f7d8), printed title, Kalam body at 1.05rem, slight alternating tilt, pop-in when unlocked. Locked notes are an empty dashed outline with a lock icon and "Se desbloquea en n intentos".

### Stamp and Circled Name (case closed)
The closing card is a taped sheet with a rubber stamp in marker (2.5px border in currentColor, irregular radius, -6deg): red pen for a win ("¡Plus Ultra!", "¡Resuelto!"), faded pencil for "Rendición" or "Fin de la ronda". On a win the solved name in the case block gets a 3px red-pen marker circle.

### Motion
One grammar, used for the newest entry only. Each field inks in left to right (clip-path inset, 380ms, cubic-bezier(0.16, 1, 0.3, 1)), staggered 90ms per column. 300ms after its field starts, the highlighter swipes in (background-size 0 to 100%, 340ms) or the red strike fades in (260ms ease-out). Supporting motion: a 0.32s horizontal shake on a wrong guess, a 0.24s pop-in for revealed cards. Under `prefers-reduced-motion: reduce` all of it is switched off and marks render in their final state.

## Do's and Don'ts

### Do:
- **Do** put the graph grid on the body below 720px and on the notebook page from 720px, with the desk (#c9d1dc) behind it.
- **Do** write every content value in Kalam and every field name, counter and control label in uppercase Barlow with tabular numerals.
- **Do** mark verdicts with highlighter, wavy underline or strike so they survive without colour, and pair numeric misses with a blue ↑/↓ arrow.
- **Do** lay new surfaces down as sheets (fresh sheet, 1px border, Sheet shadow) and fasten featured ones with the SVG tape.
- **Do** use the ink-in, then mark sequence for newly written content, and switch it off under reduced motion.
- **Do** keep touch targets at 2.75rem for buttons and tabs, 2.25rem for handwritten links.

### Don't:
- **Don't** use green, yellow or red as tile fills or status chips; they exist only as highlighter swipes and red-pen strokes.
- **Don't** put a printed uppercase label above a heading as a kicker; printed labels name a field or a count.
- **Don't** set content in the print face or labels in the handwriting face.
- **Don't** use a cream or warm ground, a dark panel, or the retired navy/gold U.A. HUD styling.
- **Don't** reuse the page's under-leaf offset as a hard shadow on any other element.
- **Don't** add stationery the notebook would not hold; new materials must be tape, paper, card stock, pen, marker or highlighter.
