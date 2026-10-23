# frozen_string_literal: true

module BphSentry
  class Configuration
    ENVIRONMENTS = %w[dev test prod].freeze

    def initialize(env: ENV, rails_env: Rails.env.to_s)
      @env = env
      @rails_env = rails_env
    end

    def environment = @env["SENTRY_ENVIRONMENT"]
    def release = @env["SENTRY_RELEASE"]
    def backend_dsn = @env["SENTRY_BACKEND_DSN"]

    def deployed?
      @rails_env == "production" && @env["IS_DOCKER_BUILD"].to_s.empty? &&
        ENVIRONMENTS.include?(environment)
    end

    def backend_enabled?
      deployed? && @env["SENTRY_BACKEND_ENABLED"] == "true"
    end

    def frontend_config
      enabled = deployed? && @env["SENTRY_FRONTEND_ENABLED"] == "true"
      return { enabled: false, feedbackEnabled: false } unless enabled

      {
        enabled: true,
        feedbackEnabled: @env["SENTRY_FEEDBACK_ENABLED"] == "true",
        dsn: @env["SENTRY_FRONTEND_DSN"],
        environment: environment,
        release: release
      }
    end
  end
end
