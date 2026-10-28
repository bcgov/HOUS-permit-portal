# frozen_string_literal: true

require "bundler/setup"
require "sentry-ruby"
require_relative "../../lib/bph_sentry"

send_live = ENV["BPH_SENTRY_SMOKE_SEND"] == "true"
Sentry.init do |config|
  config.dsn =
    (
      if send_live
        ENV.fetch("BPH_SENTRY_SMOKE_DSN")
      else
        "https://#{"a" * 32}@o1.ingest.us.sentry.io/1"
      end
    )
  config.environment = "test"
  config.release = ENV.fetch("BPH_SENTRY_SMOKE_RELEASE")
  config.transport.transport_class = Sentry::DummyTransport unless send_live
  config.background_worker_threads = 0
  config.auto_session_tracking = false
  config.send_client_reports = false
  config.breadcrumbs_logger = []
  config.data_collection.user_info = false
  config.data_collection.stack_frame_variables = false
  config.data_collection.frame_context_lines = 0
  config.before_send = lambda { |event, _hint| BphSentry::Privacy.scrub(event) }
end
Sentry.set_tags(component: "smoke")
begin
  raise ArgumentError, "Synthetic BPH smoke test"
rescue => error
  event_id = Sentry.capture_exception(error)&.event_id
end
if !send_live && Sentry.get_current_client.transport.envelopes.length != 1
  raise "Missing recording envelope"
end
puts "Ruby synthetic #{send_live ? "event sent" : "recording passed"}: #{event_id}"
Sentry.close
