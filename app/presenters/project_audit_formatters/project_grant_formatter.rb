module ProjectAuditFormatters
  class ProjectGrantFormatter < BaseFormatter
    def description
      I18n.t(
        "project_audit.actions.#{action_key}",
        user: user_display,
        person: person_name,
        application: application_name,
        block: block_name
      )
    end

    def permit_application
      id = text_value("permit_application_id")
      return if id.blank?

      @permit_application ||= PermitApplication.find_by(id: id)
    end

    def permit_application_id
      text_value("permit_application_id")
    end

    def requirement_block_id
      return unless block_grant?

      text_value("requirement_block_id")
    end

    def jurisdiction
      project&.jurisdiction
    end

    private

    def action_key
      verb = audit.action == "destroy" ? "removed" : "gave"
      "#{verb}_#{kind_name}_grant"
    end

    def kind_name
      raw = text_value("kind")
      return raw.to_s if ProjectGrant.kinds.key?(raw.to_s)

      ProjectGrant.kinds.key(raw.is_a?(String) ? raw.to_i : raw).to_s
    end

    def block_grant?
      kind_name == "block"
    end

    def person_name
      text_value("person_name").presence || "someone"
    end

    def application_name
      text_value("application_name").presence ||
        permit_application&.nickname.presence || "an application"
    end

    def block_name
      text_value("block_name").presence || "a requirement block"
    end

    def text_value(key)
      value = changes[key]
      value.is_a?(Array) ? value.last : value
    end

    def project
      return audit.associated if audit.associated_type == "PermitProject"

      audit.auditable.try(:permit_project)
    end
  end
end
