module ProjectAuditFormatters
  class PermitApplicationFormatter < BaseFormatter
    def description
      permit_name = audit.auditable&.nickname || "permit"

      case audit.action
      when "create"
        "#{user_display} created permit #{permit_name}"
      when "update"
        if discard?
          "#{user_display} removed permit #{permit_name}"
        elsif changes.key?("status")
          format_status_change
        elsif changes.key?("reference_number")
          ref = Array(changes["reference_number"]).last
          "Reference number #{ref} assigned"
        else
          "#{user_display} updated the application"
        end
      else
        I18n.t("project_audit.fallback.application_change", user: user_display)
      end
    end

    def permit_application
      audit.auditable
    end

    def permit_application_id
      audit.auditable_id
    end

    private

    def format_status_change
      new_status = Array(changes["status"]).last
      case new_status.to_s
      when PermitApplication.statuses["newly_submitted"].to_s
        "#{user_display} submitted the application"
      when PermitApplication.statuses["resubmitted"].to_s
        submitter_name = audit.auditable&.submitter&.name || user_display
        "#{submitter_name} resubmitted the application"
      when PermitApplication.statuses["revisions_requested"].to_s
        "Revisions requested — sent to submitter"
      else
        "#{user_display} changed the application status"
      end
    end
  end
end
