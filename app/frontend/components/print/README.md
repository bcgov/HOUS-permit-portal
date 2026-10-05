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
IDs. Submission reports use immutable report snapshots, including their original
cover identity and elective settings. Historical versions without these snapshots
can reuse stored PDFs but cannot reconstruct missing ones. Standalone Step Code
reports continue to render the explicitly selected saved checklist.

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

## Submission snapshots and recovery

New submissions atomically save an immutable, versioned `SubmissionVersion.report_snapshot`
with their report inputs: schema, answers, elective settings, cover identity, stable
filenames and (when present) the selected Part 3/9 checklist and project metadata.
Initial generation and recovery both read this snapshot. Current application,
jurisdiction or checklist changes must not be substituted into it. Format 1 must
remain readable when the renderer changes; preserve its field and visibility
semantics with regression fixtures. Layout and export date may change. Exact bytes,
original pagination and archived renderer binaries are not promised.

Historical submissions without a snapshot are deliberately not backfilled from
current data. Their existing PDFs remain usable; missing reports cannot be recreated.
The download dialog identifies these reports and keeps available files downloadable.
An incomplete historical version blocks cumulative ZIP reconstruction, not generation
of later versions' PDFs. External API v1/v2 contracts and standalone Step Code report
generation are unchanged.

To repair a submission, including missing/corrupt object-store files whose attachment
rows still exist:

```sh
bin/rails print_reports:recover SUBMISSION_VERSION_ID=<uuid>
```

The command reuses valid PDFs, restores missing or invalid ones, recreates deleted
PDF attachment rows, and rebuilds missing/invalid or affected cumulative ZIPs from
that version onward. It prints identifiers and restored/reused/blocked outcomes,
returns failure when any package is blocked, and never logs answers. Storage access
errors propagate; they are not interpreted as missing objects. A shared application
advisory lock coordinates normal generation and recovery. Existing package-ready
milestones and webhooks are not replayed during repair.

Generated submission PDF rows/files and ZIP attachments are disposable **only for
submissions with a complete, supported snapshot**. Keep submission versions and
snapshots permanently for as long as regeneration is required. Original uploads
are also required for complete ZIPs; snapshots contain their references, not their
binary content. Exclude snapshot-less historical submissions from routine cleanup.
Use Shrine/ActiveRecord attachment lifecycle methods, not `delete_all` or raw SQL,
when removing generated outputs. This change does not introduce scheduled cleanup.

Deploy the nullable column first, then coordinate web/worker deployment so that
old workers cannot process new snapshot-backed submissions using live metadata.
Verify capture and recovery before enabling any retention cleanup. Database and
original-upload backups remain necessary; losing the submission snapshot removes
its recovery source. Do not modify or backfill snapshots to work around a recovery
failure.
