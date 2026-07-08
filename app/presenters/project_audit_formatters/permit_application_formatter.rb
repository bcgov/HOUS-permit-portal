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
      format_status_change_for(new_status_from_changes)
    end

    def format_status_change_from_inferred_status
      format_status_change_for(permit_application&.status)
    end

    # Audited may store status as [old, new], a single value, or a scalar integer.
    def new_status_from_changes
      values = Array.wrap(changes["status"])
      return values.last if values.size >= 2

      values.first
    end

    def format_status_change_for(status_value)
      case status_enum_key(status_value)
      when "new_draft"
        "#{user_display} created the application"
      when "newly_submitted"
        "#{user_display} submitted the application"
      when "in_review"
        "#{user_display} marked the application as in review"
      when "revisions_requested"
        "Revisions requested — sent to submitter"
      when "resubmitted"
        submitter_name = audit.auditable&.submitter&.name || user_display
        "#{submitter_name} resubmitted the application"
      when "approved"
        "#{user_display} approved the application"
      when "issued"
        "#{user_display} issued the permit"
      when "withdrawn"
        "#{user_display} withdrew the application"
      else
        format_unrecognized_status_change
      end
    end

    def status_enum_key(status_value)
      return nil if status_value.nil?

      if status_value.is_a?(Integer) || status_value.to_s.match?(/\A\d+\z/)
        int_value =
          status_value.is_a?(Integer) ? status_value : status_value.to_i
        return PermitApplication.statuses.key(int_value)
      end

      key = status_value.to_s
      return key if PermitApplication.statuses.key?(key)

      nil
    end

    def format_unrecognized_status_change
      values = Array.wrap(changes["status"])
      if values.size >= 2
        return(
          format_enum_change(
            "project_audit.actions.changed_application_status",
            PermitApplication.statuses,
            "permit_application/status",
            "status"
          )
        )
      end

      "#{user_display} changed the application status on the application"
    end
  end
end
