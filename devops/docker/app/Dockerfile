# Make sure RUBY_VERSION matches the Ruby version in .ruby-version and Gemfile
ARG RUBY_VERSION=3.2.5-bullseye
FROM ruby:$RUBY_VERSION

# Rails app lives here
WORKDIR /app

# Set production environment
ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development" \
    PATH="/usr/local/node/bin:$PATH" \
    npm_config_cache="/app/.npm"

# Install packages needed for both building and running the application
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential curl git libpq-dev libvips node-gyp pkg-config python libjemalloc2 postgresql-client libproj-dev libgeos-dev proj-bin netcat && \
    rm -rf /var/lib/apt/lists/*

# Use jemalloc to improve memory management
ENV LD_PRELOAD="libjemalloc.so.2" \
    MALLOC_CONF="dirty_decay_ms:1000,narenas:2,background_thread:true" \
    RUBY_YJIT_ENABLE="1"

# Install Node.js
ARG NODE_VERSION=20.15.0
RUN curl -sL https://github.com/nodenv/node-build/archive/master.tar.gz | tar xz -C /tmp/ && \
    cd /tmp/node-build-master && ./install.sh && \
    /tmp/node-build-master/bin/node-build "${NODE_VERSION}" /usr/local/node && \
    rm -rf /tmp/node-build-master

# Install Ruby gems
COPY Gemfile Gemfile.lock ./
RUN gem install bundler:2.5.4 && \
    bundle install

# Install npm and node modules
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps --maxsockets=50

# Copy application code
COPY . .

# Precompile bootsnap code for faster boot times
RUN bundle exec bootsnap precompile app/ lib/

# Precompiling assets for production without requiring secret RAILS_MASTER_KEY - also compile SSR
ARG VITE_ENABLE_TEMPLATE_FORCE_PUBLISH
ARG VITE_BCEID_URL
ARG VITE_BUSINESS_BCEID_REGISTRATION_URL
ARG VITE_BASIC_BCEID_REGISTRATION_URL
ARG VITE_SITEMINDER_LOGOUT_URL
ARG VITE_KEYCLOAK_LOGOUT_URL
ARG VITE_POST_LOGOUT_REDIRECT_URL
COPY config/database.yml.docker_precompile_dummy /app/config/database.yml
RUN SECRET_KEY_BASE_DUMMY=1 IS_DOCKER_BUILD=true VITE_RUBY_SSR_BUILD_ENABLED=true VITE_ENABLE_TEMPLATE_FORCE_PUBLISH=${VITE_ENABLE_TEMPLATE_FORCE_PUBLISH} VITE_BCEID_URL=${VITE_BCEID_URL} VITE_BUSINESS_BCEID_REGISTRATION_URL=${VITE_BUSINESS_BCEID_REGISTRATION_URL} VITE_BASIC_BCEID_REGISTRATION_URL=${VITE_BASIC_BCEID_REGISTRATION_URL} VITE_POST_LOGOUT_REDIRECT_URL=${VITE_POST_LOGOUT_REDIRECT_URL} VITE_KEYCLOAK_LOGOUT_URL=${VITE_KEYCLOAK_LOGOUT_URL} VITE_SITEMINDER_LOGOUT_URL=${VITE_SITEMINDER_LOGOUT_URL} ./bin/rails assets:precompile

# Run and own only the runtime files as a non-root user for security
RUN useradd rails --create-home --shell /bin/bash && \
    chown -R rails:rails /app && \
    chmod -R 777 log tmp db storage

USER rails:rails

# Entrypoint - source vault variables from Hashicorp
ENTRYPOINT ["./devops/docker/app/entrypoint.sh"]

LABEL maintainer="Derek Yau <derek@laterolabs.com>"

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD ["./bin/rails", "server"]
