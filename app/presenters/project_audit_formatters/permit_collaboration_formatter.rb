module ProjectAuditFormatters
  class PermitCollaborationFormatter < BaseFormatter
    def description
      collab = audit.auditable
      if collab.blank?
        return(
          I18n.t(
            "project_audit.fallback.collaborator_change",
            user: user_display
          )
        )
      end

      collaborator_name = collab.collaborator_name
      block_name =
        collab.assigned_requirement_block_name.presence || "requirement block"

      case audit.action
      when "create"
        format_create_description(collab, collaborator_name, block_name)
      when "update"
        format_update_description(collab, collaborator_name, block_name)
      else
        I18n.t("project_audit.fallback.collaborator_change", user: user_display)
      end
    end

    def permit_application
      audit.auditable&.permit_application
    end

    def jurisdiction
      audit.auditable&.permit_application&.jurisdiction
    end

    def permit_application_id
      audit.auditable&.permit_application_id
    end

    def requirement_block_id
      audit.auditable&.assigned_requirement_block_id
    end

    private

    def format_create_description(collab, collaborator_name, block_name)
      if collab.submission?
        if collab.delegatee?
          "#{collaborator_name} set as designated submitter"
        else
          "#{collaborator_name} assigned to #{block_name}"
        end
      elsif collab.review?
        "#{collaborator_name} assigned to application"
      else
        I18n.t("project_audit.fallback.collaborator_change", user: user_display)
      end
    end

    def format_update_description(collab, collaborator_name, block_name)
      if discard?
        if collab.submission?
          if collab.delegatee?
            "#{collaborator_name} unset as designated submitter"
          else
            "#{collaborator_name} unassigned from #{block_name}"
          end
        elsif collab.review?
          "#{collaborator_name} unassigned from application"
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
  end
end
