require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
# require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
# require "action_mailbox/engine"
# require "action_text/engine"
require "action_view/railtie"
require "action_cable/engine"
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module HousPermitPortal
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.2

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    config.time_zone = "Pacific Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Don't generate system test files.
    config.generators.system_tests = nil

    # Use Sidekiq for Active Job
    config.active_job.queue_adapter = :sidekiq

    # Force UUID primary keys for new tables and models
    config.generators { |g| g.orm :active_record, primary_key_type: :uuid }

    # Allow additional hosts from environment variable AUTHORIZED_HOSTS (comma-separated)
    if ENV["AUTHORIZED_HOSTS"]
      config.hosts.concat(ENV["AUTHORIZED_HOSTS"].split(","))
    end

    # Set request id header and include request id in logs
    config.action_dispatch.request_id_header = "X-Request-Id"
    config.log_tags = [:request_id]

    # Active Record encryption keys (configured via environment variables)
    config.active_record.encryption.primary_key =
      ENV["ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY"]
    config.active_record.encryption.deterministic_key =
      ENV["ACTIVE_RECORD_ENCRYPTION_DETERMINISTIC_KEY"]
    config.active_record.encryption.key_derivation_salt =
      ENV["ACTIVE_RECORD_ENCRYPTION_KEY_DERIVATION_SALT"]
    config.active_record.encryption.extend_queries = true
  end
end
