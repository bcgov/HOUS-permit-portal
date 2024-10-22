require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
# require "active_job/railtie"
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
    config.load_defaults 7.1

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

    # we will be using dotenv locally and Hashicorp Vault in production so disable default rails master.key
    config.read_encrypted_secrets = false

    config.active_job.queue_adapter = :sidekiq

    # Don't generate system test files.
    config.generators.system_tests = nil

    # This will force all new tables to use UUIDs for id field
    config.generators { |g| g.orm :active_record, primary_key_type: :uuid }

    if ENV["AUTHORIZED_HOSTS"]
      config.hosts.concat(ENV["AUTHORIZED_HOSTS"].split(","))
    end
    # This sets up keys needed for active record attribute encryption

    # Add request-id to the logging tags
    config.middleware.insert_before 0,
                                    ActionDispatch::RequestId,
                                    header: "X-Request-Id"
    config.log_tags = [:request_id]

    # the minimum lengths for the keys should be 12 bytes for the
    # primary key (this will be used to derive the AES 32
    # bytes key) and 20 bytes for the salt.

    # You can auto generate this in the console with: bin/rails db:encryption:init

    config.active_record.encryption.primary_key =
      ENV["ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY"]
    config.active_record.encryption.deterministic_key =
      ENV["ACTIVE_RECORD_ENCRYPTION_DETERMINISTIC_KEY"]
    config.active_record.encryption.key_derivation_salt =
      ENV["ACTIVE_RECORD_ENCRYPTION_KEY_DERIVATION_SALT"]
    # This will enable unique validations on encrypted fields
    config.active_record.encryption.extend_queries = true
  end
end
