# Overview

Welcome to the codebase for BC's Housing Permit Portal. Rails serves the backend and React/MST frontend.

## Local development

Ruby and Node run on your host using rbenv and nvm. Docker runs PostgreSQL, Redis, Elasticsearch, SeaweedFS, and AnyCable-Go. There is no local application image to build.

### Prerequisites

- Git LFS (`git lfs install` before cloning; run `git lfs pull` for an existing clone).
- Docker Desktop, or Docker Engine with Compose v2 supporting `up --wait` (2.20+), and `curl`.
- rbenv initialized in your shell, with Ruby from `.ruby-version` (currently 4.0.6).
- nvm initialized in your shell, with Node from `.nvmrc` (currently v24.21.0).
- Native build dependencies: compiler tools, PostgreSQL client libraries, GEOS, PROJ, and libvips. These are loaded by host Ruby; no host PostgreSQL or Redis daemon is needed.

On macOS, install Xcode command-line tools and the libraries:

```bash
xcode-select --install # if not already installed
brew install rbenv ruby-build libpq geos proj vips
export PATH="$(brew --prefix libpq)/bin:$PATH"
```

On Debian/Ubuntu, install the equivalent native dependencies:

```bash
sudo apt-get install build-essential libpq-dev libgeos-dev libproj-dev proj-bin libvips-dev pkg-config
```

Ensure the project's Ruby is active (`ruby -v`), not the system Ruby. `bin/setup` validates Ruby and Node versions and installs the Bundler version from `Gemfile.lock`.

### First-time setup

From the repository root, after installing prerequisites:

```bash
rbenv install -s "$(cat .ruby-version)"
nvm install && nvm use
cp .env_example .env
cp .env_example.compose .env.compose
./bin/local-infra-up
./bin/setup
./bin/dev
```

The two example files are tracked; the copied files are ignored. Copy them only when setting up a new environment; the scripts never overwrite an existing environment file.

`bin/local-infra-up` waits for infrastructure health and creates the private `hous-local` SeaweedFS bucket automatically. `bin/setup` installs gems and npm packages, copies `config/database.yml.local` to `config/database.yml` if missing, verifies development/test database names differ, prepares the development and test databases, loads initial development seeds through Rails’ standard `db:prepare` task, and builds the PDF renderer. Repeated setup preserves data; Rails only seeds when initializing the development database.

`bin/dev` starts Rails, Vite, the PDF report bundle watcher, Sidekiq, and Ruby AnyCable RPC. It uses Overmind if installed, then Hivemind, otherwise Foreman (installed automatically if absent). All processes inherit your selected Ruby/Node runtimes.

### Daily use

With the project’s Ruby and Node selected in your shell (`nvm use` in a new terminal):

```bash
./bin/local-infra-up
./bin/dev
```

Open the app at <http://localhost:3000>. Ctrl-C stops Rails, Vite, Sidekiq, and Ruby AnyCable RPC. The Docker infrastructure keeps running until you stop it separately.

### Infrastructure scripts

| Command                     | What it does                                                                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `./bin/local-infra-up`      | Starts infrastructure, waits for readiness, and ensures the SeaweedFS bucket exists. Safe to run again when services are already running. |
| `./bin/local-infra-down`    | Stops and removes infrastructure containers, preserving all volume data.                                                                  |
| `./bin/local-infra-down -v` | Stops infrastructure and deletes its volumes, including development/test databases, Redis data, search indexes, and SeaweedFS uploads.    |

These scripts operate on the dedicated `hous-permit-portal-local` Compose project. `local-infra-down` forwards additional options to `docker compose down`; `-v` and `--volumes` are equivalent.

To reset all infrastructure data, first stop `bin/dev` with Ctrl-C, then run:

```bash
./bin/local-infra-down -v
./bin/local-infra-up
./bin/setup
./bin/dev
```

**Deleting volumes permanently removes this stack's local data.** Setup recreates the databases and demo seeds; environment files and host-installed dependencies are retained.

Inspect service status or follow logs from the repository root:

```bash
docker compose -p hous-permit-portal-local -f compose.yml --env-file .env.compose ps
docker compose -p hous-permit-portal-local -f compose.yml --env-file .env.compose logs -f
# Follow one service, for example:
docker compose -p hous-permit-portal-local -f compose.yml --env-file .env.compose logs -f postgres
```

### Configuration and endpoints

`.env_example.compose` is the infrastructure template. Copy it to `.env.compose`, which `bin/local-infra-up/down` explicitly pass to Compose. Compose does not use the application's `.env` file. All images are pinned directly in `compose.yml`, which also supplies default ports, users, passwords, and bucket settings. The template contains only commented port overrides; uncomment a setting when a port conflicts with another local app. An otherwise empty `.env.compose` uses all defaults. Shell-exported variables still take precedence for configurable settings according to Compose's normal rules.

`.env_example` is the host Rails/Node template. Copy it to `.env`; its defaults match `compose.yml`. When overriding an infrastructure port in `.env.compose`, update its matching application setting below.

| Service            | Default host endpoint       | Settings to keep aligned                                                                         |
| ------------------ | --------------------------- | ------------------------------------------------------------------------------------------------ |
| Rails              | <http://localhost:3000>     | Explicit port in `Procfile.dev`                                                                  |
| Vite               | <http://127.0.0.1:3036>     | Explicit port in `Procfile.dev`                                                                  |
| PostgreSQL         | `127.0.0.1:15432`           | Compose `POSTGRES_HOST_PORT` → app `POSTGRES_PORT`; matching `POSTGRES_USER`/`POSTGRES_PASSWORD` |
| Redis              | `127.0.0.1:16379`           | Compose `REDIS_HOST_PORT` → every app `*_DEV_REDIS_URL`                                          |
| Elasticsearch      | <http://127.0.0.1:19200>    | Compose `ELASTICSEARCH_HOST_PORT` → app `ELASTICSEARCH_URL`                                      |
| SeaweedFS API      | <http://127.0.0.1:19001>    | Compose `SEAWEEDFS_HOST_PORT` → app `BCGOV_OBJECT_STORAGE_ENDPOINT`                              |
| SeaweedFS Admin UI | <http://127.0.0.1:19002>    | Compose `SEAWEEDFS_ADMIN_HOST_PORT`                                                              |
| WebSockets         | `ws://localhost:8080/cable` | Compose `ANYCABLE_HOST_PORT` → app `ANYCABLE_URL`                                                |
| Ruby RPC           | `0.0.0.0:50051`             | `Procfile.dev` RPC command → Compose `ANYCABLE_RPC_PORT`                                         |

Redis logical databases are Sidekiq **0**, AnyCable **1**, rate limiting **2**, Simple Feed **3**, and cache **4**.

Default PostgreSQL credentials are `hous` / `hous-local-password`. Credentials normally need no configuration. If you customize them, Compose `POSTGRES_USER`/`POSTGRES_PASSWORD` must match `.env`. SeaweedFS uses access key `hous-local`, secret `hous-local-password`, and bucket `hous-local`, matching the application's `BCGOV_OBJECT_STORAGE_*` defaults. Admin UI login is `hous-local` / `hous-local-password`. These credentials and the example JWT/encryption keys are for local development only.

SeaweedFS provides local S3-compatible storage with an automatically created private bucket; no manual provisioning, account registration, or license file is needed. Its `-s3.allowedOrigins` setting in `compose.yml` permits browser requests from localhost/127.0.0.1 port 3000 and exposes upload ETags. Uploads use browser-reachable presigned URLs; do not point the host application at Docker's internal `seaweedfs` hostname.

If your existing `.env.compose` customized `MINIO_HOST_PORT` or `MINIO_CONSOLE_HOST_PORT`, transfer those values to `SEAWEEDFS_HOST_PORT` or `SEAWEEDFS_ADMIN_HOST_PORT`. Existing environment files are not rewritten. SeaweedFS starts with its own empty storage volume; previous MinIO volumes are neither reused nor deleted. Existing database records referring to old uploads will not have replacement files. Other infrastructure data is retained.

AnyCable-Go connects to Docker Redis internally and to the host RPC server through `host.docker.internal`. The Compose file supplies Linux host-gateway support. RPC binds to `0.0.0.0` so containers can reach it; published infrastructure ports bind to loopback.

The database template uses `hous_permit_portal_development` and `hous_permit_portal_test`. Leave `DATABASE_URL` unset for local use: Rails would otherwise use it in preference to the separate database names. If an existing database config is present, setup preserves it; ensure its host, port, and user match `.env`. Update it using the tracked local template if they differ. Do not set `IS_DOCKER_BUILD` locally, even to `false`: several application checks use its presence.

### Local login and optional integrations

Local email/password login is enabled by both `ENABLE_LOCAL_PASSWORD_AUTH=true` and `VITE_ENABLE_LOCAL_PASSWORD_AUTH=true`. These flags are never honored in production. Use `/login` or `/admin`.

Seeded accounts all use password `P@ssword1`:

| Role                    | Email                               |
| ----------------------- | ----------------------------------- |
| submitter               | submitter@example.com               |
| review_manager          | review_manager@example.com          |
| reviewer                | reviewer@example.com                |
| super_admin             | super_admin@example.com             |
| regional_review_manager | regional_review_manager@example.com |
| technical_support       | technical_support@example.com       |

Local email previews use `letter_opener` on the host. ClamAV is not included: leave `CLAM_AV_HOSTNAME` blank and uploads use the existing scanning bypass. Compliance checks are disabled by default.

Keycloak, licensed Consigno digital-seal validation, CHES, Archistar, and government geospatial APIs remain optional external integrations. The example `*_stub` URLs support the existing VCR test recordings and are not running services. Configure real endpoints and credentials when working on those features; the default local stack does not provision or emulate them. Production deployment configuration is separate and unchanged.

### Debugging and troubleshooting

Run these in separate terminals instead of `bin/dev` when you need direct debugger access:

```bash
bundle exec rails server -b 127.0.0.1 -p 3000
VITE_RUBY_HOST=127.0.0.1 VITE_RUBY_PORT=3036 bin/vite dev
npm run dev:print
bundle exec sidekiq
ANYCABLE_RPC_HOST=0.0.0.0:50051 bundle exec anycable
```

- If Docker is unavailable, start Docker Desktop or the daemon.
- If a published port is occupied, stop the conflicting service or change the port and its matching application setting in the table above. Restart affected processes after configuration changes.
- If readiness times out, inspect logs and Docker memory/disk availability. Elasticsearch keeps the Apple Silicon JVM workaround and uses a 512 MB heap.
- The gateway can start before Ruby RPC, but authenticated WebSockets need the RPC process running.
- `bin/dev` rebuilds report assets automatically. Wait for the `print` process to finish its initial build before generating PDFs.
- If initial seeding fails, fix the reported error and run `bin/rails db:seed`, then rerun `./bin/setup` to finish preparation. You can also run seeds explicitly when needed; they are not part of daily startup. Keep infrastructure running while seeding.

## DevOps

See the `/devops` folder for Dockerfiles and Helm-Charts

## Testing

All unit tests should be run like the following:

```
bundle exec rspec
```

Some other notes

- For digital seal tests, the we have not uploaded documents with the real document to the repo, but captured the request responses
- The local database template uses `hous_permit_portal_test`, separate from development. Leave `DATABASE_URL` unset when running local tests.

## ERD generation

- To generate up to date erd diagrams, make sure you have graphiviz installed locally

```
bundle exec erd
```

## Formatting & Linting

Frontend linting is performed by Prettier. The backend files are set up to use syntax_tree
for formatting and Rubocop for linting. The only recommended setup required for this is
to install the RubyLSP plugin for VSCode, and select syntax_tree as the formatter in the exension settings.
Binaries for these should be installed as shims automatically upon running bundle install.
All other configuration should be handled by the included workspace settings and .rubocop.yml file.

## Intellisense

At the moment getting intellisense to work out of the box on Mac is difficult but
can be accomplished with some configuration. Install the Solargraph extension and
then in your User VSCode settings add:

"solargraph.commandPath": "/Users/YOUR-USERNAME/.rbenv/shims/solargraph",
"solargraph.bundlerPath": "/Users/YOUR-USERNAME/.rbenv/shims/bundler",
"solargraph.useBundler": true

ensure that you are using rbenv and it is set up correctly.

## Local Gotenberg PDF generation

The application and standalone step-code jobs can render the shared HTML reports
through local Gotenberg. Rails still owns attachment storage, ZIPs and notifications.
Existing PDFs are reused and remain downloadable. Gotenberg is the sole PDF
renderer; the overheating AcroForm service is unchanged.

```sh
bin/local-infra-up
bin/dev
```

Set these in the host application's `.env`, then restart Rails and Sidekiq:

```dotenv
GOTENBERG_URL=http://127.0.0.1:13000
```

If overriding `GOTENBERG_HOST_PORT` in `.env.compose`, adjust `GOTENBERG_URL` too.
The service port is loopback-only. No login token or container-to-Vite connection
is required: each request uploads the report bundle, saved data, fonts and images.
Chromium is blocked from fetching HTTP/HTTPS resources. It waits for the report's
readiness marker and matching payload digest; conversion errors fail the job.

`bin/dev` watches report changes automatically. `npm run build` builds both the
application and report bundles, and Rails asset precompilation includes both for
Docker builds. The bundles remain separate: report CSS is loaded only in the
standalone PDF document, never in the interactive app. The report build uses
production React transforms even on a development machine. Missing/stale assets
fail with a rebuild instruction. `npm run build:print` and `npm run dev:print`
remain available for report-only work. Browser preview routes and their APIs have
been removed.

Submit a new application or generate a standalone report through the normal UI to
exercise the jobs. Download application still prepares missing PDFs and full/selective
ZIPs. ZIPs now fail on missing members instead of silently skipping them. Full packages are saved against explicit versions, and generated attachments
are promoted before readiness. Standalone reports retain the existing virus-scan
policy: enable a reachable ClamAV or use the project's existing local scan-disable
configuration; this integration does not bypass scan failures.

To compare an existing historical submission without replacing its stored PDF:

```sh
GOTENBERG_URL=http://127.0.0.1:13000 bundle exec rails runner '
  version = SubmissionVersion.find("YOUR_SUBMISSION_VERSION_ID")
  report = PrintReports::Data.for_generation.application(version.permit_application, version.id)
  PrintReports::Renderer.new.render(report) { |path| FileUtils.cp(path, Rails.root.join("tmp/comparison.pdf")) }
'
```

Comparison PDFs contain application data: keep them local and delete after review.
Historical elective visibility deliberately matches the existing pipeline: saved
schema/answers plus the application's customization snapshot, not an invented
per-version customization history. New schema fields are not introduced by this change.

The modal refreshes while waiting and times out after three minutes. Closing and
reopening lets the user retry; a timeout does not cancel a Sidekiq job already running.

Run ordinary regression tests and optional live-container checks:

```sh
bundle exec rspec spec/services/print_reports_data_spec.rb spec/jobs/pdf_generation_job_spec.rb spec/jobs/zipfile_job_spec.rb spec/jobs/step_code_report_generation_job_spec.rb spec/services/supporting_documents_zipper_spec.rb spec/services/print_reports_generation_spec.rb spec/services/print_reports_renderer_spec.rb
RUN_GOTENBERG_SPECS=true bundle exec rspec spec/services/print_reports_renderer_spec.rb
```

Gotenberg is required for new PDF generation. There is no legacy renderer or
fallback. The application Docker build includes the HTML report bundle. Before
deploying this version to OpenShift, provision an internal Gotenberg service and
set GOTENBERG_URL for the workers; that infrastructure is not provisioned here.
Browser print previews, their APIs, and development fixture screens have been
removed. Report validation uses generated PDFs and automated tests.
