module ProjectAuditFormatters
  class PermitProjectFormatter < BaseFormatter
    def description
      case audit.action
      when "create"
        "#{user_display} created this project"
      when "update"
        if changes.key?("state")
          format_enum_change(
            "project_audit.actions.changed_project_state",
            PermitProject.states,
            "permit_project/state",
            "state"
          )
        elsif changes.key?("viewed_at")
          format_viewed_at_change(
            "project_audit.actions.marked_project_read",
            "project_audit.actions.marked_project_unread"
          ) || default_update_message
        elsif changes.key?("full_address")
          "#{user_display} changed the project address"
        elsif changes.key?("title")
          "#{user_display} changed the project name"
        else
          default_update_message
        end
      else
        I18n.t("project_audit.fallback.generic_change", user: user_display)
      end
    end

    private

    def default_update_message
      "#{user_display} updated the project"
    end
  end
end
