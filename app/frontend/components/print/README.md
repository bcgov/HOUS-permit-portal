# PDF report presentation

This folder owns the HTML/CSS reports rendered by Gotenberg. It is not loaded by
the normal application. There are no browser preview routes, report APIs, print
toolbars, or browser fixture screens.

## Structure

- `generation-entry.tsx` mounts a standalone document from the packaged JSON payload.
- `report-content.tsx` selects the application, Part 3, or Part 9 report.
- `form/` renders application schema fields and saved answers.
- `components/` provides shared report primitives, cover, and readiness handling.
- `styles/report.css` defines layout and print rules; `styles/tokens.css` defines
  report fonts, colours, and spacing. Step-code components also use inline styles.
- `__tests__/fixtures/` contains synthetic data used by automated PDF tests.

Rails `PrintReports::Data.for_generation` requires explicit submission/checklist
IDs. Application reports use saved schema and answers. Elective visibility uses
application customization snapshots, matching the previous pipeline; older
submissions do not have historically exact per-version elective settings.
Historical step-code reports use the saved checklist snapshot, not the current one.

## Build and readiness

Run `npm run build:print`, or `npm run dev:print` to watch changes. Vite writes
`public/vite-print/report.js`, `report.css`, and a source digest manifest. Rails
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
