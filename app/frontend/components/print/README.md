# HTML print reports

This folder owns **all new HTML report presentation**. It runs alongside the existing React-PDF pipeline. Nothing here generates server attachments, submits a form, or changes ZIP contents.

## Where to make a change

| Change                                                  | Location                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| Fonts, colours, spacing defaults                        | `styles/tokens.css`                                          |
| Paper margins, page breaks, table styling               | `styles/report.css`                                          |
| Cover page and record metadata                          | `components/report-cover.tsx`                                |
| Shared sections, fields, tables, contact groups         | `components/report-*.tsx`                                    |
| Supported FormIO field types and aliases                | `form/field-renderers.tsx`                                   |
| Formatting raw values and option labels                 | `form/field-values.ts`                                       |
| Schema traversal and conditional visibility             | `form/form-report.tsx`                                       |
| Application report composition                          | `permit-application/report.tsx`                              |
| Part 3 and Part 9 report sections                       | `step-code/part-3/sections/`, `step-code/part-9/sections/`   |
| Shared HTML primitives used by step-code sections       | `components/step-code-primitives.tsx`                        |
| Loading, asset readiness, error boundary, browser print | `components/report-shell.tsx`                                |
| API authorization and snapshot selection                | Rails `Api::PrintReportsController` and `PrintReports::Data` |

Step-code sections were ported from the existing report presentations to preserve domain labels and calculations. They import HTML primitives here, never React-PDF. The old generation components are still independent until phase 2; a domain change must be checked against both during this transition.

## Data flow and versions

Authenticated read-only endpoints:

- `/api/permit_applications/:id/print_report?submission_version_id=...`
- `/api/permit_applications/:id/step_code_print_report?submission_version_id=...`
- `/api/part_3_step_codes/:id/print_report?checklist_id=...`
- `/api/part_9_step_codes/:id/print_report?checklist_id=...`

Responses contain `{ data: { kind, identity, form_json, submission_data } }` for applications, or `{ data: { kind, identity, checklist, step_code } }` for step-code reports. The report client preserves schema/answer keys without camelizing; only step-code payloads use existing camelization helpers.

Application previews select the requested version or latest submission. With no submissions they show saved draft answers. Historical previews never substitute current form answers or a current checklist. Application-associated step-code previews require a saved checklist snapshot. Elective visibility matches the existing PDF renderer: apply the application's stored customization snapshot to a cloned version schema. Older submissions do not have per-version elective settings, so this does not guarantee historically exact elective configuration. Saved version labels and answers remain authoritative; no current schema or answers are substituted. Drafts use their existing customization rules. Download dialog preview links select the document's submission-version ID directly, independently of the version selected in the underlying form.

Historical project metadata absent from that snapshot is shown as unavailable rather than borrowed from the current step code. Historical cover addresses are omitted when no independently saved address is available; submitted address answers remain in the report body.

The HTML routes replace `print_report` with `print`, and the associated step-code route is `/permit-applications/:id/step-code/print`. Standalone routes use `/part-3-step-code/:id/print` and `/part-9-step-code/:id/print`.

Preview links appear in development or when `VITE_QA_MODE=true` and `qa_tools_enabled` is enabled. APIs enforce the corresponding server gate and normal resource access policies. Existing Download/Generate PDF actions retain their original behaviour.

## Adding a form field

1. Add its renderer (or base-type alias) to `fieldRenderers`.
2. Resolve option labels from the supplied schema, not from current templates.
3. Preserve `false`, `0`, empty states, and every entry in a repeating group.
4. Use existing display helpers; never save or load a different model inside a renderer.
5. Add a check to `__tests__/browser-fixtures.tsx` and exercise a long value in print preview.

New, removed, renamed, or reordered instances of supported fields need no report-specific changes. Unknown types have an explicit fallback showing saved data. Wide/nested grids use labelled entry blocks instead of squeezing text into unreadable columns. FormIO condition utilities operate on cloned inputs; the report does not instantiate the interactive form or persist calculations.

## Browser and regression checks

1. Run `bundle exec rspec spec/requests/api/print_reports_spec.rb spec/jobs/pdf_generation_job_spec.rb spec/jobs/pdf_renderer_spec.rb spec/jobs/zipfile_job_spec.rb`.
2. Run `npm run build` and `npm run build:ssr`.
3. With local Rails/Vite running, sign in and open `/__print-tests` (development only). The fixture page executes rendering checks and shows the result. Use `?kind=part3`, `?kind=part3-baseline`, `?kind=part3-mixed`, and `?kind=part9` for the synthetic step-code samples.
4. Open an application and use **Print preview**. For saved versions, check the version ID in the URL and on the cover.
5. Print at **Letter**, **100% scale**, with browser-added **headers/footers disabled**. Save as PDF. Confirm the long-answer ending and last table row, repeated table headers, readable text, no overlap, no accidental blank pages, and the intentional cover break.
6. Check historical and unauthorized versions, normal screens, existing PDF downloads, and submission ZIPs.

The JSON fixtures are synthetic FactoryBot data, not production submissions. Request specs write fresh optional inspection payloads only under `tmp/print-report-fixtures/`.

## Future automated generation

The report marks `#print-ready` only when data, component rendering, fonts and images have completed. A loading/error page must never be treated as a successful PDF. The document components do not call `window.print`; only the toolbar does. Gotenberg/Playwright can later consume the same routes and styles once authentication, job orchestration, and attachment handling are implemented. No server PDF generation is added by this folder.

## Validation recorded for this implementation

- 29 Rails request/service and existing PDF/ZIP regression examples passed.
- The development fixture runs 43 rendering checks, including conditional/logic visibility, compound addresses, nested repeating fields, schema changes, safe rich text, file names, and populated Part 3 baseline/mixed-use and Part 9 values.
- Browser-saved Letter PDFs were reviewed as page images and extracted text: the application stress case retained all 65 paragraphs, 90 table entries, and a long unbroken URL; Part 3 baseline/mixed-use and Part 9 samples retained their expected source metrics. No blank pages remained in those verified outputs. Text extraction confirmed an 11-point body baseline.
- As review_manager, the DSQ-001-000-044 download dialog was verified to link v1/v2/v3 to their own submission IDs; v1 and v3 render distinct saved answers with printing enabled. Elective settings follow existing PDF behavior as documented above.
- The main and existing SSR production builds passed. Repository-wide TypeScript checking still reports existing errors outside this folder; no errors were reported for the new print code at validation time.

The browser preview is intentionally continuous on screen. **Print / Save as PDF** is the pagination preview. Do not add estimated page-height logic to imitate pagination on screen.
