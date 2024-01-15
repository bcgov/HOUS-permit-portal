# syntax = docker/dockerfile:1

# Make sure RUBY_VERSION matches the Ruby version in .ruby-version and Gemfile
ARG RUBY_VERSION=3.2.2-bullseye
FROM ruby:$RUBY_VERSION as base

# Rails app lives here
WORKDIR /app

# Set production environment
ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development"


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build gems and node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential curl git libpq-dev libvips node-gyp pkg-config python

# Install Git LFS
RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash && \
    apt-get install git-lfs && \
    git lfs install

# Install JavaScript dependencies
ARG NODE_VERSION=20.10.0
ENV PATH=/usr/local/node/bin:$PATH
RUN curl -sL https://github.com/nodenv/node-build/archive/master.tar.gz | tar xz -C /tmp/ && \
    /tmp/node-build-master/bin/node-build "${NODE_VERSION}" /usr/local/node && \
    rm -rf /tmp/node-build-master

# Install application gems
COPY Gemfile Gemfile.lock ./
RUN gem install bundler:2.5.4
RUN bundle install

# Install node modules
COPY package.json package-lock.json ./
RUN npm install

# Copy application code
COPY . .

# Precompile bootsnap code for faster boot times
RUN bundle exec bootsnap precompile app/ lib/

# Precompiling assets for production without requiring secret RAILS_MASTER_KEY
COPY config/database.yml.docker_precompile_dummy /app/config/database.yml
# Also add a flag ASSET_PRECOMPILATION that we can use to stub Shrine
RUN SECRET_KEY_BASE_DUMMY=1 ASSET_PRECOMPILATION=true ./bin/rails assets:precompile
# RUN rm /app/config/database.yml

# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl netcat libvips postgresql-client && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built artifacts: gems, application
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /app /app

# Run and own only the runtime files as a non-root user for security
RUN useradd rails --create-home --shell /bin/bash && \
    chown -R rails:rails db log storage tmp && \
    chmod -R 777 log tmp db storage

USER rails:rails

# Entrypoint - source vault variables from Hashicorp
ENTRYPOINT ["./bin/entrypoint.sh"]

LABEL maintainer="Derek Yau <derek@laterolabs.com>"

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD ["./bin/rails", "server"]
