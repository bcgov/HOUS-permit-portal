module ProjectAuditFormatters
  class ProjectMeetingFormatter < BaseFormatter
    def description
      case audit.action
      when "update"
        format_update_message
      else
        I18n.t("project_audit.fallback.generic_change", user: user_display)
      end
    end

    private

    def format_update_message
      if changes.key?("status")
        format_status_change
      elsif schedule_details_changed?
        "#{user_display} rescheduled the project meeting"
      else
        "#{user_display} updated the project meeting"
      end
    end

    def format_status_change
      case new_status_from_changes
      when "open"
        "#{user_display} submitted a project meeting request"
      when "scheduled"
        "#{user_display} scheduled the project meeting"
      when "completed"
        "#{user_display} completed the project meeting"
      when "closed"
        "#{user_display} cancelled the project meeting"
      else
        "#{user_display} changed the project meeting status"
      end
    end

    def new_status_from_changes
      status_value = Array.wrap(changes["status"]).last
      return nil if status_value.nil?

      if status_value.is_a?(Integer) || status_value.to_s.match?(/\A\d+\z/)
        return ProjectMeeting.statuses.key(status_value.to_i)
      end

      status_value.to_s
    end

    def schedule_details_changed?
      changes.key?("confirmed_date") || changes.key?("contact_method") ||
        changes.key?("meeting_url")
    end
  end
end
