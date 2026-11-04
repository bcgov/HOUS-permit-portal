# frozen_string_literal: true

require_relative "bph_sentry/configuration"
require_relative "bph_sentry/privacy"

module BphSentry
  def self.capture_exception(exception)
    if Configuration.new.backend_enabled? && Sentry.initialized?
      Sentry.capture_exception(exception)&.event_id
    end
  rescue StandardError
    # Observability must not alter application error handling.
    nil
  end
end
