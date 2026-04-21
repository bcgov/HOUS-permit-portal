module ProjectAuditFormatters
  class PermitProjectFormatter < BaseFormatter
    def description
      case audit.action
      when "create"
        "#{user_display} created this project"
      when "update"
        if changes.key?("full_address")
          "#{user_display} changed the project address"
        elsif changes.key?("title")
          "#{user_display} changed the project name"
        else
          "#{user_display} updated the project"
        end
      else
        I18n.t("project_audit.fallback.generic_change", user: user_display)
      end
    end
  end
end
