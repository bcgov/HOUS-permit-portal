module ProjectAuditFormatters
  class SubmissionVersionFormatter < BaseFormatter
    def description
      case audit.action
      when "update"
        if changes.key?("viewed_at")
          format_viewed_at_change(
            "project_audit.actions.marked_application_read",
            "project_audit.actions.marked_application_unread"
          ) ||
            I18n.t(
              "project_audit.fallback.application_change",
              user: user_display
            )
        else
          I18n.t(
            "project_audit.fallback.application_change",
            user: user_display
          )
        end
      else
        I18n.t("project_audit.fallback.application_change", user: user_display)
      end
    end

    def permit_application
      audit.auditable&.permit_application
    end

    def permit_application_id
      permit_application&.id
    end

    def jurisdiction
      permit_application&.jurisdiction
    end
  end
end
