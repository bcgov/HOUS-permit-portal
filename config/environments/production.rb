require "active_support/core_ext/integer/time"
require_relative "../../lib/multi_logger"

Rails.application.configure do
  # Specify AnyCable WebSocket server URL to use by JS client
  config.after_initialize do
    config.action_cable.url =
      ActionCable.server.config.url =
        ENV.fetch("ANYCABLE_URL", "/cable") if AnyCable::Rails.enabled?
  end
  # Settings specified here will take precedence over those in config/application.rb.

  # Code is not reloaded between requests.
  config.enable_reloading = false

  # Eager load code on boot. This eager loads most of Rails and
  # your application in memory, allowing both threaded web servers
  # and those relying on copy on write to perform better.
  # Rake tasks automatically ignore this option for performance.
  config.eager_load = true

  # Full error reports are disabled and caching is turned on.
  config.consider_all_requests_local = false
  config.action_controller.perform_caching = true

  # Ensures that a master key has been made available in ENV["RAILS_MASTER_KEY"], config/master.key, or an environment
  # key such as config/credentials/production.key. This key is used to decrypt credentials (and other encrypted files).
  # config.require_master_key = true

  # Disable serving static files from `public/`, relying on NGINX/Apache to do so instead.
  # config.public_file_server.enabled = false

  # Enable serving of images, stylesheets, and JavaScripts from an asset server.
  # config.asset_host = "http://assets.example.com"

  # Specifies the header that your server uses for sending files.
  # config.action_dispatch.x_sendfile_header = "X-Sendfile" # for Apache
  # config.action_dispatch.x_sendfile_header = "X-Accel-Redirect" # for NGINX

  # Mount Action Cable outside main process or domain.
  # config.action_cable.mount_path = nil
  # config.action_cable.url = "wss://example.com/cable"
  config.action_cable.allowed_request_origins =
    ENV["ANYCABLE_ALLOWED_REQUEST_ORIGINS"]

  # Assume all access to the app is happening through a SSL-terminating reverse proxy.
  # Can be used together with config.force_ssl for Strict-Transport-Security and secure cookies.
  # config.assume_ssl = true

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  # Don't force all traffic to SSL here since we want the liveness probes to be able to hit /up properly without redirecting to an SSL scheme
  # instead this will be redirected on the route level
  # config.force_ssl = true

  # Logger configured in initializer
  #config.logger = #

  # Info include generic and useful information about system operation, but avoids logging too much
  # information to avoid inadvertent exposure of personally identifiable information (PII). If you
  # want to log everything, set the level to "debug".
  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "info")

  # Use a different cache store in production.
  if ENV["IS_DOCKER_BUILD"].blank?
    config.cache_store =
      :redis_cache_store,
      {
        url:
          "redis://#{ENV["REDIS_SENTINEL_MASTER_SET_NAME"]}/#{ENV["CACHE_REDIS_DB"]&.to_i || 4}",
        sentinels:
          Resolv
            .getaddresses(ENV["REDIS_SENTINEL_HEADLESS"])
            .map do |address|
              {
                host: address,
                port: (ENV["REDIS_SENTINEL_PORT"]&.to_i || 26_379)
              }
            end,
        role: :master,
        namespace: "cache"
      }
  end

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation cannot be found).
  config.i18n.fallbacks = true

  # Don't log any deprecations.
  config.active_support.report_deprecations = false

  # Do not dump schema after migrations.
  config.active_record.dump_schema_after_migration = false

  config.action_mailer.delivery_method = :ches

  # Enable DNS rebinding protection and other `Host` header attacks.
  # config.hosts = [
  #   "example.com",     # Allow requests from example.com
  #   /.*\.example\.com/ # Allow requests from subdomains like `www.example.com`
  # ]
  # Skip DNS rebinding protection for the default health check endpoint.
  # config.host_authorization = { exclude: ->(request) { request.path == "/up" } }
  config.action_mailer.default_url_options = {
    host: ENV["APP_DOMAIN"],
    protocol: "https"
  }

  config.after_initialize do
    Rails.application.routes.default_url_options =
      Rails.application.config.action_mailer.default_url_options
  end

  # Change the logger to Multilogger in production so we can write both to a file (compliance) and to STDOUT for openshift
  # Rotate the logs daily
  file_logger =
    Logger.new(
      Rails.root.join(
        "log",
        "#{ENV["HOSTNAME"]}-#{Time.now.strftime("%m-%d-%y")}.log"
      ),
      "daily"
    )
  stdout_logger = Logger.new(STDOUT)

  config.logger = MultiLogger.new(stdout_logger, file_logger)
  # Ensure ActiveRecord uses the same logger
  ActiveRecord::Base.logger = config.logger

  config.log_tags = [:request_id]
end
