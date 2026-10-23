# frozen_string_literal: true

module BphSentry
  module Privacy
    UUID = /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i
    ROLES = %w[
      submitter
      reviewer
      review_manager
      regional_review_manager
      technical_support
      super_admin
    ].freeze
    COMPONENTS = %w[web worker anycable-rpc smoke].freeze
    module_function

    def user_context(user)
      unless user && UUID.match?(user.id.to_s) && ROLES.include?(user.role.to_s)
        return {}
      end
      { id: user.id.to_s }
    end

    # A new payload is constructed rather than recursively scrubbing arbitrary application data.
    def payload(event)
      data = event.to_h
      values = data.dig(:exception, :values)
      unless event.is_a?(Sentry::ErrorEvent) && values.is_a?(Array) &&
               values.any?
        return nil
      end

      tags = data[:tags] || {}
      clean_tags = {}
      sidekiq = data.dig(:contexts, :sidekiq)
      component = sidekiq ? "worker" : (tags[:component] || tags["component"])
      clean_tags[:component] = component if COMPONENTS.include?(component)
      role = component == "web" ? (tags[:role] || tags["role"]) : nil
      clean_tags[:role] = role if ROLES.include?(role)
      route = component == "web" ? (tags[:route] || tags["route"]) : nil
      clean_tags[:route] = route if route.to_s.match?(%r{\A[a-z_/]+#[a-z_]+\z})
      job_class =
        sidekiq&.dig(:job, "class") || sidekiq&.dig("class") ||
          tags[:job_class] || tags["job_class"]
      clean_tags[:job_class] = job_class if job_class.to_s.match?(
        /\A[A-Z][A-Za-z0-9_:]*Job\z/
      )

      user = data[:user] || {}
      id = user[:id] || user["id"]
      clean_user = component == "web" && UUID.match?(id.to_s) ? { id: id } : {}
      {
        type: "event",
        event_id: data[:event_id],
        timestamp: data[:timestamp],
        platform: :ruby,
        level: :error,
        environment: data[:environment],
        release: data[:release],
        sdk: {
          name: "sentry.ruby",
          version: Sentry::VERSION,
          settings: {
            infer_ip: "never"
          }
        },
        tags: clean_tags,
        user: clean_user,
        exception: {
          values:
            values.map do |value|
              {
                type: identifier(value[:type]),
                value: "[Filtered]",
                stacktrace: {
                  frames:
                    Array(value.dig(:stacktrace, :frames)).map do |frame|
                      clean_frame(frame)
                    end
                }
              }
            end
        }
      }
    rescue StandardError
      nil
    end

    def identifier(value)
      if value.to_s.match?(/\A[A-Za-z_$][A-Za-z0-9_$:.!?<>=# -]{0,200}\z/)
        value.to_s
      else
        "Error"
      end
    end

    def clean_frame(frame)
      filename = frame[:filename].to_s.split(/[?#]/).first.to_s
      filename = filename.sub(%r{\A.*?/(app|lib|config)/}, '\1/')
      filename = "[external]" unless filename.match?(
        %r{\A(?:app|lib|config)/[A-Za-z0-9_./-]+\.rb\z}
      )
      {
        filename: filename,
        function: identifier(frame[:function]),
        lineno: frame[:lineno].is_a?(Integer) ? frame[:lineno] : nil,
        in_app: frame[:in_app] == true
      }.compact
    end
  end
end
