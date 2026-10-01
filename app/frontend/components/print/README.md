# PDF report presentation

This folder owns the HTML/CSS reports rendered by Gotenberg. It is not loaded by
the normal application. There are no browser preview routes, report APIs, print
toolbars, or browser fixture screens.

## Structure

- `generation-entry.tsx` mounts a standalone document from the packaged JSON payload.
- `report-content.tsx` selects the application, Part 3, or Part 9 report.
- `form/` renders application schema fields and saved answers.
- `components/` provides shared report primitives, cover, and readiness handling.
- `styles/print.css` defines layout and print rules; `styles/tokens.css` defines
  report defaults. Foundational BC blue, gold, and font identity come from the
  dependency-free shared `styles/brand.ts`; app theme values are unchanged.
- `__tests__/fixtures/` contains synthetic data used by automated PDF tests.

Rails `PrintReports::Data.for_generation` requires explicit submission/checklist
IDs. Application reports use saved schema and answers. Elective visibility uses
application customization snapshots, matching the previous pipeline; older
submissions do not have historically exact per-version elective settings.
Historical step-code reports use the saved checklist snapshot, not the current one.
Submission covers show the current application address, jurisdiction, applicant
and template tags (or template nickname when there are no tags). These fields
are not independently snapshotted per submission; the cover labels this distinction.

## Build and readiness

`npm run build` builds both the application and report bundles; `bin/dev` watches
both automatically. Rails asset precompilation also includes reports. The internal
`build:print` and `dev:print` scripts remain available for report-only work. Vite writes
`public/vite-print/report.js`, `print.css`, and a source digest manifest. Rails
rejects missing or stale assets and packages the bundle, fonts, logo, and data
for Gotenberg. Keep layout changes here rather than adding another report layout.

The document exposes `#print-ready` and root readiness state only after rendering,
fonts, and images complete. Gotenberg checks readiness and the payload digest;
loading and failed reports must never become successful PDF attachments.

## Validation

Run the `spec/services/print_reports_*_spec.rb` tests. With local Gotenberg running,
set `RUN_GOTENBERG_SPECS=true` to also exercise Chromium conversion, long answers,
repeating rows, and synthetic Part 3/Part 9 reports. Inspect generated PDFs for
clipping, overlap, missing answers, and unexpected blank pages.

When adding field renderers, preserve raw schema keys, false, zero, repeating
entries, and saved option labels. Do not load current answers or mutate form data.
See the root README for local setup and the job/attachment/ZIP workflow.

## Report design

Letter portrait uses half-inch top/side margins and a three-quarter-inch footer
margin. The dedicated cover is counted but has no footer. Submission content pages
show the application ID, saved submission date and current applicant in spaced
columns with labels above bold values,
with Page X of Y aligned right and a horizontal divider above. Standalone step-code
reports retain their reference and stage. Footers use CSS page-margin boxes;
dynamic text is escaped before insertion into CSS and the footer SVG. The SVG
embeds BC Sans and is decoded before readiness; long values wrap, reserving more
footer space when needed rather than clipping or shrinking them.

Application layout wrappers retain their visibility/data scopes but do not add
visual nesting. A repeated enclosing heading is suppressed, never an answer.
Short scalar fields are paired inside their logical group (labels <=60 and values
<=80 characters); multiline, compound, address and long fields stay full width.
Wide/complex repeating grids become labelled records. Empty answers remain explicit.

Standalone answers use a 1.5pt gray left rule, 8pt left padding and 4pt spacing
below the bold question, without background shading. Cover metadata and table
cells retain their existing layouts. Checkbox groups and multi-select fields show
only selected labels, in saved schema order, as checked lines with hanging indents;
unknown saved options follow with their saved values. Single-choice answers have
no checkmark. Empty selections show "Not provided". Long answers can split across
pages while their question stays with the start of the answer.

Step-code sections use semantic report blocks and explicit table spans, without
React-PDF style conversion or imports of the interactive application's theme.
Use typed table layout/keepTogether options and report classes rather than inline
presentation styles. Long tables repeat headers, and oversized records may split;
readability and preserving every answer take priority over minimizing page count.

The live renderer specs cover historical source handling, nesting/conditions,
long records, repeated headers, footer escaping/page counts, populated Part 9
(including distinct TEDI/MEUI values), and Part 3 standard/baseline/mixed-use cases.
