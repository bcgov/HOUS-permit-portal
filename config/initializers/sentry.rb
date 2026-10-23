require Rails.root.join("lib/bph_sentry")

settings = BphSentry::Configuration.new
if settings.backend_enabled?
  component = "web"
  Sidekiq.configure_server { component = "worker" }
  AnyCable.configure_server { component = "anycable-rpc" }

  Sentry.init do |config|
    config.dsn = settings.backend_dsn
    config.environment = settings.environment
    config.release = settings.release
    config.auto_session_tracking = false
    config.send_client_reports = false
    config.send_modules = false
    config.breadcrumbs_logger = []
    config.enabled_patches = []
    config.before_send_log = ->(*) { nil }
    config.before_send_metric = ->(*) { nil }
    config.sidekiq.propagate_traces = false
    config.data_collection.user_info = false
    config.data_collection.cookies = false
    config.data_collection.http_headers.request = false
    config.data_collection.http_headers.response = false
    config.data_collection.http_bodies = []
    config.data_collection.url_query_params = false
    config.data_collection.database_query_data = false
    config.data_collection.queues = false
    config.data_collection.stack_frame_variables = false
    config.data_collection.frame_context_lines = 0
    config.before_breadcrumb = ->(*) { nil }
    config.before_send =
      lambda do |event, _hint|
        event.tags[:component] = component
        payload = BphSentry::Privacy.payload(event)
        BphSentry::PrivateEvent.new(event, payload) if payload
      end
  end
end
