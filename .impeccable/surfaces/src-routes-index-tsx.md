---
version: 1
slug: "src-routes-index-tsx"
primary_target: "src/routes/index.tsx"
related_targets: ["src/components/game"]
---

Scope: the game page (src/routes/index.tsx and src/components/game/*). Mode: Operate.
Audience: Spanish-speaking casual MHA fan, phone-first, 2–3 minutes a day. Job: guess today's character in few attempts, read each clue at a glance, share the result.
Constraints: game logic, ids, localStorage keys and copy meaning stay; functional changes are proposed separately; no ads; code-led (no image generation).
Memorable moment: each guess is written into the notebook — ink appears, then the highlighter swipes the matches and a red pen strikes the misses.
Unresolved: spoiler selector, new attributes and hint redesign are functional proposals pending approval.

## Direction contract

THESIS: Guessing is analysis. The page is a spread of Izuku's "Análisis de héroes para el futuro" notebook; it refuses the category's dark panel of coloured tiles under a logo.

OWN-WORLD: cool graph paper (#EEF1F4 ground, 1px #C9D6E6 grid), navy ballpoint ink #1C2330, blue pen #2E5AAC for handwriting, red pen #D2372B strikes misses, highlighter green #B8F29A for matches and yellow #FBE36B for "close", masking tape strips. Marker display (Permanent Marker), handwritten notes (Kalam), printed notebook labels and tabular data (Barlow Semi Condensed). Index tabs on the page edge for modes.

STORY: The visitor sees today's case open in the notebook, writes a hero's name on the ruled line, and watches the entry get annotated; within seconds they know what matched, what was close and which way to go.

FIRST VIEWPORT: Printed notebook header (No./date/puzzle and countdown as margin note) with the marker title; directly below, the "¿Quién es?" case block with taped blank photo and mode index tabs; the writing line (search) sits inside the first viewport on a 390px phone; streak notes in the margin; attempts start under it.

FORM: Deku's analysis notebook, position 1 on the grounded list (IMPECCABLE'S PICK, chosen by the user over the assigned U.A. ID card); seed key 7913e09f.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
