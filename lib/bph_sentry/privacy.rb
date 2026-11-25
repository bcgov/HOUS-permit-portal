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

    # Use the native SDK event so stack traces, mechanisms and grouping stay intact.
    def scrub(event)
      unless event.is_a?(Sentry::ErrorEvent) && event.exception&.values&.any?
        return
      end

      privacy =
        event.contexts.delete(:privacy) || event.contexts.delete("privacy") ||
          {}
      names = Array(privacy[:names] || privacy["names"])
      sidekiq =
        event.contexts.delete(:sidekiq) || event.contexts.delete("sidekiq")
      if sidekiq
        event.tags[:component] = "worker"
        event.tags[:job_class] = sidekiq.dig(:job, "class") ||
          sidekiq["class"] || sidekiq[:class]
      end
      if event.tags[:component] != "web"
        event.user = {}
        event.tags.delete(:role)
        event.tags.delete(:route)
      else
        event.user = event.user.slice(:id)
      end
      event.extra = {}
      event.breadcrumbs = nil
      event.attachments = []
      event.dynamic_sampling_context = nil
      if event.request
        event.transaction =
          event.tags[:route] ||
            (event.transaction unless event.transaction.to_s.start_with?("/"))
        %i[data cookies headers env query_string url].each do |key|
          event.request.public_send("#{key}=", nil)
        end
      end
      event.tags = scrub_value(event.tags, names)
      event.contexts = scrub_value(event.contexts, names)
      event.message = scrub_text(event.message, names)
      event.exception.values.each do |exception|
        exception.value = scrub_text(exception.value, names)
        exception.stacktrace&.frames&.each do |frame|
          frame.vars = nil
          frame.pre_context = frame.post_context = frame.context_line = nil
          frame.filename = scrub_text(frame.filename, names, identifier: true)
          frame.abs_path = scrub_text(frame.abs_path, names, identifier: true)
          frame.function = scrub_text(frame.function, names, identifier: true)
        end
      end
      event.sdk = event.sdk.merge(settings: { infer_ip: "never" })
      event
    rescue StandardError
      nil
    end

    def scrub_value(value, names = [], context = nil)
      case value
      when Hash
        value.each_with_object({}) do |(key, item), clean|
          if !(
               key.to_s == "name" &&
                 %w[browser os runtime device].include?(context.to_s)
             ) &&
               key.to_s.match?(
                 /\A(?:password|secret|token|authorization|api[_-]?key|email|name|first[_-]?name|last[_-]?name|full[_-]?name|ip_address|ip|args|arguments|params|parameters|binds|body|data|cookies|headers|vars|answers|snapshot)\z/i
               )
            next
          end
          clean[key] = if key.to_s.match?(
               /\A(?:id|event_id|trace_id|span_id|parent_span_id|release|version)\z/
             )
            item
          else
            scrub_value(item, names, key)
          end
        end
      when Array
        value.map { |item| scrub_value(item, names) }
      when String
        scrub_text(value, names)
      else
        value
      end
    end

    def scrub_text(value, names = [], identifier: false)
      return value unless value.is_a?(String)
      sql =
        value.match?(/\b(?:SELECT|INSERT|UPDATE|DELETE)\b|(?:ERROR|DETAIL):/i)
      text =
        value
          .gsub(%r{https?://[^\s"'<>]+}i) do |url|
            url.sub(%r{(://)[^/@]+@}, '\\1[Filtered]@').split(/[?#]/).first
          end
          .gsub(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, "[Filtered email]")
          .gsub(
            /\b(?:Bearer\s+\S+|sntrys_\S+|eyJ[A-Za-z0-9_.+-]+)\b/i,
            "[Filtered credential]"
          )
          .gsub(
            /\b(password|secret|token|api[_ -]?key|first[_-]?name|last[_-]?name|full[_-]?name|name)["']?\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/i
          ) do |match|
            if sql && match.match?(/[:=]\s*(?:\$\d+|\?|:\w+)\z/)
              match
            else
              "#{Regexp.last_match(1)}=[Filtered]"
            end
          end
      unless identifier
        text =
          text.gsub(/\b\d{1,3}(?:\.\d{1,3}){3}\b/, "[Filtered IP]").gsub(
            /(?:\+?\d[\d ().-]{7,}\d)/,
            "[Filtered number]"
          )
      end
      names
        .compact
        .uniq
        .sort_by { |name| -name.length }
        .each do |name|
          text =
            text.gsub(
              /(?<![[:alnum:]])#{Regexp.escape(name)}(?![[:alnum:]])/i,
              "[Filtered name]"
            ) unless name.empty?
        end
      # SQL identifiers and placeholders stay useful; literal values and row details do not.
      if sql
        text =
          text.gsub(/'(?:[^']|'')*'/, "'[Filtered]'").gsub(
            /^(\s*DETAIL:).*$/i,
            '\\1 [Filtered]'
          )
      end
      text
    end
  end
end
