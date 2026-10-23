# frozen_string_literal: true

require_relative "bph_sentry/configuration"
require_relative "bph_sentry/privacy"

module BphSentry
  # Keep the SDK's event interface while exposing only the allowlisted serialization.
  class PrivateEvent < Sentry::ErrorEvent
    def initialize(event, payload)
      super(configuration: Sentry.configuration)
      self.event_id = event.event_id
      @payload = payload
    end

    def to_h = @payload
  end

  def self.capture_exception(exception)
    if Configuration.new.backend_enabled? && Sentry.initialized?
      Sentry.capture_exception(exception)&.event_id
    end
  rescue StandardError
    # Observability must not alter application error handling.
    nil
  end
end
