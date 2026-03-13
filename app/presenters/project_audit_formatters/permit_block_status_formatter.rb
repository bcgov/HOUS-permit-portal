module ProjectAuditFormatters
  class PermitBlockStatusFormatter < BaseFormatter
    def description
      block_status = audit.auditable
      if block_status.blank?
        return(
          I18n.t("project_audit.fallback.generic_change", user: user_display)
        )
      end

      block_name =
        block_status.requirement_block_name.presence || "requirement block"

      case audit.action
      when "update"
        "#{user_display} changed status of #{block_name}"
      when "destroy"
        "#{user_display} removed status for #{block_name}"
      else
        I18n.t(
          "project_audit.fallback.block_change",
          user: user_display,
          block_name: block_name
        )
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
      audit.auditable&.requirement_block_id
    end
  end
end
