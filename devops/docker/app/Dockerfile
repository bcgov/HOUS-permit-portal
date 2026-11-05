# Keep the Ruby and Node versions aligned with .ruby-version and .nvmrc.
ARG RUBY_VERSION=4.0.9-slim-trixie
ARG NODE_VERSION=24.22.1

FROM docker.io/library/node:${NODE_VERSION}-trixie-slim AS node

FROM docker.io/library/ruby:${RUBY_VERSION} AS base

# Rails app lives here
WORKDIR /app

# Set production environment
ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development:test"

# Patch inherited packages as well as the libraries installed here. Refresh this
# layer with --pull --no-cache when rebuilding for distribution security updates.
# ImageMagick and libvips are runtime dependencies of mini_magick/ruby-vips.
RUN apt-get update -qq && \
    apt-get upgrade --no-install-recommends -y && \
    apt-get install --no-install-recommends -y \
      ca-certificates imagemagick libgeos-c1t64 libjemalloc2 libpq5 \
      libproj25 libvips netcat-openbsd postgresql-client proj-bin tzdata && \
    rm -rf /var/lib/apt/lists/*

# Use jemalloc to improve memory management
ENV LD_PRELOAD="libjemalloc.so.2" \
    MALLOC_CONF="dirty_decay_ms:1000,narenas:2,background_thread:true" \
    RUBY_YJIT_ENABLE="1"

# Build native gems and frontend/report assets in a disposable stage. Node and
# its package manager come from the versioned official image, not node-build master.
FROM base AS build
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential git libffi-dev libgeos-dev libgmp-dev libpq-dev \
      libproj-dev libssl-dev libyaml-dev pkg-config && \
    rm -rf /var/lib/apt/lists/*
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Install Ruby gems
COPY Gemfile Gemfile.lock ./
# Bundler selects (and, if necessary, installs) the BUNDLED WITH lockfile version.
RUN bundle install && \
    rm -rf /usr/local/bundle/ruby/*/cache

# Install npm and node modules
ENV NPM_CONFIG_IGNORE_SCRIPTS=true \
    npm_config_cache="/app/.npm"
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy application code
COPY . .

# Precompile bootsnap code for faster boot times
RUN bundle exec bootsnap precompile app/ lib/

# Precompile application and report assets without requiring secret RAILS_MASTER_KEY
ARG FRONTEND_BUILD_ENV_JSON={}
ARG SENTRY_RELEASE
ARG SENTRY_UPLOAD_SOURCEMAPS=false
ENV SENTRY_RELEASE=${SENTRY_RELEASE}
COPY config/database.yml.docker_precompile_dummy /app/config/database.yml
RUN --mount=type=secret,id=sentry_auth_token \
    SECRET_KEY_BASE_DUMMY=1 IS_DOCKER_BUILD=true NODE_ENV=production SENTRY_UPLOAD_SOURCEMAPS=${SENTRY_UPLOAD_SOURCEMAPS} \
    bundle exec ruby devops/docker/app/with-vite-env.rb ./bin/rails assets:precompile && \
    test -z "$(find public/vite -type f -name '*.map' -print -quit)" && \
    rm -rf node_modules .npm

# Copy the installed gems and built application into the patched runtime base.
# Keep report source files: the renderer checks their digest at runtime.
FROM base AS runtime
ARG SENTRY_RELEASE
ENV SENTRY_RELEASE=${SENTRY_RELEASE}
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /app /app

# Gem archives may have restrictive modes; the Rails user needs read access.
RUN useradd rails --create-home --shell /bin/bash && \
    mkdir -p log tmp db storage && \
    chown -R rails:rails /app && \
    chgrp -R 0 log tmp db storage && \
    chmod -R u+rwX,g+rwX,o-w log tmp db storage && \
    chmod -R a+rX "${BUNDLE_PATH}"

USER rails:rails

# Entrypoint - source vault variables from Hashicorp
ENTRYPOINT ["./devops/docker/app/entrypoint.sh"]

LABEL maintainer="Derek Yau <derek@laterolabs.com>"

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD ["./bin/rails", "server"]
