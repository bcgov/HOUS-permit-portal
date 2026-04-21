module ProjectAuditFormatters
  class PermitApplicationFormatter < BaseFormatter
    def description
      permit_name = audit.auditable&.nickname || "permit"

      case audit.action
      when "create"
        # Distinguish between a new permit application and a submitted permit application.
        if changes.key?("status")
          return format_status_change
        elsif permit_application&.submitted?
          # Fallback to the inferred status if the status was not present in the audited changes.
          return format_status_change_from_inferred_status
        end

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
      format_status_change_for(new_status)
    end

    def format_status_change_from_inferred_status
      format_status_change_for(permit_application&.status)
    end

    def format_status_change_for(status_value)
      status_str = status_value.to_s

      case status_str
      when PermitApplication.statuses["new_draft"].to_s
        "#{user_display} created the application"
      when PermitApplication.statuses["newly_submitted"].to_s
        "#{user_display} submitted the application"
      when PermitApplication.statuses["in_review"].to_s
        "#{user_display} marked the application as in review"
      when PermitApplication.statuses["revisions_requested"].to_s
        "Revisions requested — sent to submitter"
      when PermitApplication.statuses["resubmitted"].to_s
        submitter_name = audit.auditable&.submitter&.name || user_display
        "#{submitter_name} resubmitted the application"
      when PermitApplication.statuses["approved"].to_s
        "#{user_display} approved the application"
      when PermitApplication.statuses["issued"].to_s
        "#{user_display} issued the permit"
      when PermitApplication.statuses["withdrawn"].to_s
        "#{user_display} withdrew the application"
      else
        "#{user_display} changed the application status on the application"
      end
    end
  end
end
