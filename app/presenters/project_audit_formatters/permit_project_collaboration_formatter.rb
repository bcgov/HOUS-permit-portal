module ProjectAuditFormatters
  class PermitProjectCollaborationFormatter < BaseFormatter
    def description
      collaboration = audit.auditable
      reviewer_name = collaboration&.collaborator&.user&.name || "reviewer"

      case audit.action
      when "create"
        I18n.t(
          "project_audit.actions.assigned_project_reviewer",
          user: user_display,
          reviewer: reviewer_name
        )
      when "update"
        if discard?
          I18n.t(
            "project_audit.actions.removed_project_reviewer",
            user: user_display,
            reviewer: reviewer_name
          )
        else
          I18n.t(
            "project_audit.fallback.collaborator_change",
            user: user_display
          )
        end
      else
        I18n.t("project_audit.fallback.collaborator_change", user: user_display)
      end
    end

    def permit_application
      nil
    end

    def permit_application_id
      nil
    end

    def jurisdiction
      audit.auditable&.permit_project&.jurisdiction
    end
  end
end
