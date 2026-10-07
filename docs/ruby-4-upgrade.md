# Ruby 4 / Debian Trixie upgrade (HUB-5580)

Ruby moves from 3.2.5 to 4.0.6. Both application Dockerfiles use the verified `ruby:4.0.6-trixie` image. Node remains 24.21.0. The original upgrade used Bundler 2.5.22; the lockfile now selects 4.0.20 to avoid duplicate platform-constant warnings with Ruby 4. All 13 Rails gems remain locked to 7.2.3.2; AnyCable and Rails configuration defaults are unchanged. Production retains jemalloc and YJIT.

The development image uses Trixie's `libgdk-pixbuf-2.0-0` package name. The old `libgdk-pixbuf2.0-0` name failed package installation. The production build also grants read/traverse access to installed gems for the non-root Rails user. The locked `colored2` archive contains mode-0640 Ruby files, reproduced in the old Ruby 3.2 installation as well; without this build fix, production boot fails with LoadError. The gem version and application container structure are preserved.

## Dependency changes

| Gem                      | Before           | After                                       | Reason                                                                                                                                    |
| ------------------------ | ---------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| faraday-multipart        | 1.0.4            | 1.2.0                                       | Old gemspec rejects Ruby 4.                                                                                                               |
| faraday-follow_redirects | 0.3.0            | 0.5.0                                       | Old gemspec rejects Ruby 4.                                                                                                               |
| grpc                     | 1.71.0           | 1.78.1                                      | First stable native packages accepting Ruby 4 for Apple Silicon and Linux amd64/arm64.                                                    |
| google-protobuf          | 4.30.2           | 4.34.0                                      | First compatible 4.x native packages for the same platforms; satisfies unchanged AnyCable dependencies.                                   |
| ffi                      | 1.16.3           | 1.17.2                                      | Native builds of 1.16.3, 1.17.0 and 1.17.1 fail with `invalid CFI advance_loc expression` on this Apple Silicon toolchain. 1.17.2 builds. |
| debug                    | 1.9.0            | 1.11.1                                      | 1.9.0 segfaults at an actual breakpoint under Ruby 4; 1.11.1 passes breakpoint/stepping checks.                                           |
| rgeo                     | 3.0.1            | 3.1.0                                       | GEOS extension fails on both Linux architectures because Ruby 4 removed `RTypedData.typed_flag`.                                          |
| rgeo-proj4               | 4.0.0            | 5.0.0                                       | 4.0.0 restricts RGeo to 3.0.x; 5.0.0 supports RGeo 3.1 and Ruby 4. Its documented breaking change is the higher minimum Ruby version.     |
| set                      | 1.1.0            | 1.1.2                                       | Old implementation overwrites Ruby 4's built-in Set methods and crashes Sidekiq's heartbeat with `undefined method 'keys' for nil`.       |
| csv                      | Ruby default gem | 3.3.6, explicit dependency                  | Rails boot fails with `cannot load such file -- csv` without the dependency under Ruby 4.                                                 |
| readline                 | Ruby stdlib      | 0.0.4, explicit development/test dependency | Existing Byebug requires `readline`; Ruby 4 boot otherwise fails with LoadError.                                                          |

The already locked `observer` 0.1.2 and `ostruct` 0.6.3 also become explicit dependencies. Production asset precompilation reproduced missing-library errors in FactoryBot and Rswag when development-only transitive dependencies were excluded. Their versions do not change.

Every other locked gem version is preserved, including Bootsnap, Pry, Byebug, pg, Sidekiq, AnyCable, and googleapis-common-protos-types. The lockfile adds the local `arm64-darwin-25` platform and selects gRPC/Protobuf Linux GNU binaries. No unrestricted Bundler update was used.

Relevant upstream changes: [RGeo 3.1 history](https://github.com/rgeo/rgeo/blob/v3.1.0/History.md), [rgeo-proj4 history](https://github.com/rgeo/rgeo-proj4/blob/master/History.md), [Set 1.1.2 Ruby core detection](https://github.com/ruby/set/blob/v1.1.2/lib/set.rb), [Ruby 4 release notes](https://www.ruby-lang.org/en/news/2025/12/25/ruby-4-0-0-released/).

## Local verification

Validation was performed on Apple Silicon with Ruby 4.0.6, using fresh Ruby 4 native extensions. The Ruby 3.2 baseline was captured before editing.

- Ruby 3.2 baseline and final Ruby 4 run: each has 2,404 RSpec examples, zero failures and the same six existing pending examples.
- Ruby 4 final syntax scan: 1,343 tracked Ruby files, rake tasks and Ruby executable scripts; zero failures.
- Rails boot and `zeitwerk:check`: pass locally and in the Linux arm64 development container.
- Production configuration eager loading with YJIT, PostgreSQL and Redis Sentinel-backed cache access: pass against isolated services.
- Native GEOS polygon area, PROJ EPSG:4326 to EPSG:3857 coordinates, and PostgreSQL `SELECT 1`: pass. GEOS availability is explicitly asserted; a successful RGeo installation alone can silently omit GEOS.
- Rails console startup: pass.
- Pry/Byebug and debug: actual breakpoint, `next`, value inspection and continuation pass.
- Sidekiq: Rails startup, heartbeat, Redis enqueue and execution of a temporary smoke job pass against an isolated Redis instance. RSpec's fake job mode was disabled only in the temporary verification process so a real worker executed the job.
- AnyCable: RPC startup and a gRPC connection request reach the application's authentication code, returning its existing missing-token error. This is not an authenticated websocket end-to-end test.
- RuboCop without autocorrection: baseline 963 offenses in 956 files; Ruby 4 target 966. Four new block/argument forwarding suggestions in the existing `lib/multi_logger.rb` become applicable with TargetRubyVersion 4.0; one existing block-alignment offense in `app/blueprints/permit_project_blueprint.rb` disappears under the Ruby 4 parser. No unrelated style rewriting was performed.
- Syntax Tree formatter (`stree check`, no rewriting): both interpreters report only the same existing formatting issue in `spec/models/contact_spec.rb`. This comparison was run against unchanged tracked Ruby source after the runtime edits.
- Original validation used Bundler 2.5.22, which emitted duplicate Gem::Platform constant warnings with Ruby 4's RubyGems. The subsequent lockfile update to Bundler 4.0.20 addresses these warnings without suppressing them.

Application review covered removed APIs, keyword/block forwarding, implicit standard-library loading, exception/backtrace handling, JSON/YAML serialization, HTTP wrappers and job payloads. No application source or test assertion changes were needed. Automated service tests use the existing stubs/VCR recordings; they do not establish live external-service compatibility.

An intermediate run with the final dependencies produced 1,068 failures after Docker's virtual disk reached 98% usage and Elasticsearch turned red. Its allocation report explicitly rejected shards because of the disk high watermark. Disposable build cache was reclaimed, retaining images, containers and database volumes; all primary shards recovered before rerunning the suite. The final full rerun passed all 2,404 examples with zero failures and the same six pending examples; no tests were changed or skipped to obtain this result.

## Final container verification

- Clean Ruby 4 native dependency installations succeeded on Apple Silicon, Linux arm64 and Linux amd64.
- Development image: `linux/arm64`, Ruby 4.0.6, Bundler 2.5.22, Node 24.21.0, Debian Trixie (13.6). Build, Bootsnap precompilation, Rails eager loading and native GEOS checks pass.
- Production image: `linux/amd64`, the same runtime versions. Build, Bootsnap precompilation, frontend build and PDF renderer/SSR build pass.
- The final production image runs as UID 1000 (`rails`), with YJIT enabled and jemalloc actually loaded. Eager loading, native GEOS/Protobuf, PostgreSQL access and Redis Sentinel cache reads/writes pass.
- The production web process returns HTTP 200 from `/up`. The production AnyCable process starts with gRPC 1.78.1 and responds to a real RPC connection request through the application's authentication code.
- Temporary PostgreSQL, Redis, Redis Sentinel, web and RPC containers were used for these checks. They are separate from the application's existing local services.

The development image above records historical upgrade validation. Local development now uses host Ruby/Node and `bin/local-infra-up`; see the README. Reproduce production builds with `docker build --platform linux/amd64 -f devops/docker/app/Dockerfile .`. Run the suite with `RAILS_ENV=test bundle exec rspec`. The local build tags are `hub-5580-ruby4:dev-arm64` and `hub-5580-ruby4:prod-amd64`.

## Staging acceptance and rollout

Before production promotion, validate the same built image in development/staging:

- Login/logout, sessions, authentication redirects, permit editing and submission.
- Multipart uploads and live external-service requests.
- Authenticated websocket connection, authorization, updates and reconnects.
- Background jobs and downloaded permit application, Part 3 and Part 9 PDFs; inspect the rendered output.

Promote the verified image and update web, worker and Ruby-based AnyCable workloads together. Monitor errors, crashes, job retries, websocket failures, memory and response times. Roll back to the previous image if regressions appear. No database migrations, public API changes or intentional data-format changes are included. No staging or production deployment has been performed as part of local validation.
