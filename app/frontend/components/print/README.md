# PDF reports

Standalone HTML/CSS reports converted to PDF by Gotenberg.

## Report data

- `SubmissionVersion.report_snapshot` is a JSONB column containing report inputs
  saved at submission: schema, answers, elective settings, cover details, and any
  selected Step Code checklist. It stays unchanged so PDFs can be regenerated
  from the original data.
- `PrintReports::Data` prepares the saved submission or checklist data passed to
  the print report components as props. `.for_generation` creates this helper.

## Build

`bin/dev` watches report assets; `npm run build` includes them.
To rebuild reports separately or resolve stale assets:

```sh
npm run build:print
```

## Tests

```sh
bundle exec rspec spec/services/print_reports_*_spec.rb
```

With local Gotenberg running, test actual PDF conversion:

```sh
RUN_GOTENBERG_SPECS=true bundle exec rspec spec/services/print_reports_renderer_spec.rb
```

For layout changes, inspect generated PDFs for missing answers, clipping,
overlap, and blank pages.

## Recovery

Restore missing or invalid submission PDFs and rebuild cumulative ZIPs from
the selected version onward:

```sh
bin/rails print_reports:recover SUBMISSION_VERSION_ID=<uuid>
```

Valid PDFs are reused; affected ZIPs are always rebuilt. The command can be
rerun after a partial failure.

Regeneration requires a complete, supported report snapshot. Historical
submissions without one can reuse existing PDFs but cannot recreate missing
reports. Keep snapshots and original uploads: snapshots store upload
references, not the files themselves.
