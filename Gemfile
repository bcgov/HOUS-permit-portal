source "https://rubygems.org"

ruby "3.2.5"

# Bundle edge Rails instead: gem "rails", github: "rails/rails", branch: "main"
gem "rails", "~> 7.1.4.1"

# Use postgresql as the database for Active Record
gem "pg", "~> 1.1"
gem "activerecord-nulldb-adapter", "1.0.1" # for Dockerfile asset build

# Use the Puma web server [https://github.com/puma/puma]
gem "puma", ">= 6.4.2"

# Use Redis adapter to run Action Cable in production
# gem "redis", ">= 4.0.1"

gem "vite_rails", "3.0.17"
gem "dotenv-rails", "2.8.1", require: "dotenv/rails-now"

# Use Kredis to get higher-level data types in Redis [https://github.com/rails/kredis]
# gem "kredis"

# Use Active Model has_secure_password [https://guides.rubyonrails.org/active_model_basics.html#securepassword]
# gem "bcrypt", "~> 3.1.7"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: %i[windows jruby]

# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", require: false

# Authentication
gem "devise", "4.9.3"
gem "devise_invitable", "~> 2.0.9"
gem "devise-jwt", "0.8.1"
gem "devise-jwt-cookie", "0.5.1"
gem "json-jwt", ">= 1.16.6"
gem "dry-container", "0.8.0"
gem "omniauth-keycloak", "1.5.1"
gem "omniauth-rails_csrf_protection", "1.0.1"

gem "blueprinter", "~> 1.0.2"

gem "awesome_print", "~> 1.9"
gem "sidekiq", "~> 7.2.4"
gem "shrine", "~> 3.5.0"
gem "redis", "~> 5.0.8"
gem "image_processing", "~> 1.12.2"
gem "acts_as_list", "~> 1.1.0"
gem "searchkick", "~> 5.3.1"
gem "elasticsearch", "~> 8.11.0"
gem "kaminari", "~> 1.2.2"
gem "acts-as-taggable-on", "~> 10.0.0"
# Assuming BC Common Object Management Service (COMS) is compatible with S3 formats:
gem "aws-sdk-s3", "~> 1.141.0"
gem "pundit", "~> 2.3.1"
gem "phonelib", "~> 0.8.5"
gem "roo", "~> 2.10"
gem "discard", "~> 1.2"
gem "faraday", "~> 2.9.0"
gem "factory_bot", "~> 6.4"
# The timcop gem mocks Time, it is only used in specs and for seeding a published template version to get around time based validations
gem "timecop", "~> 0.9.8"
gem "sidekiq-cron", "~> 1.12"
gem "sidekiq-unique-jobs", "~> 8.0"
gem "rubyzip", "~> 2.3.2"
gem "anycable-rails", "~> 1.4"
gem "addressable", "~> 2.8"
gem "friendly_id", "~> 5.5.1"
gem "exception_notification", "~> 4.5.0"
gem "nokogiri", ">= 1.16.5"
gem "rdoc", ">= 6.6.3.1"
gem "rack", ">= 3.0.9.1"
gem "uppy-s3_multipart", "~> 1.2"
gem "simple-feed", "~> 3.2.0"
# For external api docs
gem "rswag-api", "~> 2.13"
gem "rswag-ui", "~> 2.13"

# brew install geos
# bundle config build.rgeo --with-geos-dir=/usr/local/opt/geos
gem "rgeo", "~> 3.0.1"
# brew install proj
gem "rgeo-proj4", "~> 4.0.0"
gem "aasm", "~> 5.5.0"

group :development, :test do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[mri windows]
  gem "pry-byebug", "~> 3.10.1"
  gem "rspec-rails", "~> 6.1.0"
  gem "rswag-specs", "~> 2.13"
  gem "factory_bot_rails", "~> 6.4.2"
  gem "faker", "~> 3.2.2"
  gem "shoulda-matchers", "~> 5.3.0"
  gem "vcr", "~> 6.2"
  gem "bullet", "~> 7.1.6"
end

group :test do
  gem "rspec-sidekiq", "~> 4.1"
end

group :development do
  # Use console on exceptions pages [https://github.com/rails/web-console]
  gem "web-console"

  # Add speed badges [https://github.com/MiniProfiler/rack-mini-profiler]
  # gem "rack-mini-profiler"

  # Speed up commands on slow machines / big apps [https://github.com/rails/spring]
  # gem "spring"

  gem "prettier_print", "~> 1.2"
  gem "syntax_tree", "~> 6.2"
  gem "syntax_tree-haml", "~> 4.0"
  gem "syntax_tree-rbs", "~> 1.0"
  gem "letter_opener", "~> 1.8"
  gem "rails-erd", "~> 1.5"
  gem "rubocop", "~> 1.67", require: false
  gem "rubocop-rails", "~> 2.26", require: false
  gem "solargraph", "~> 0.50.0", require: false
end

gem "faraday-multipart", "~> 1.0"

gem "rack-attack", "~> 6.7"
gem "data_migrate", "~> 9.4"
