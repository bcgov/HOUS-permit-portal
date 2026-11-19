module ProjectAuditFormatters
  class ProjectMembershipFormatter < BaseFormatter
    def description
      case audit.action
      when "create"
        invite_sent
      when "destroy"
        destroy_sentence
      when "update"
        update_sentence
      else
        fallback
      end
    end

    def jurisdiction
      project&.jurisdiction
    end

    private

    def invite_sent
      I18n.t(
        "project_audit.actions.sent_project_invitation",
        user: user_display,
        person: person_name
      )
    end

    def destroy_sentence
      if pending_invite?
        if audit.comment == ProjectMembership::INVITE_DECLINED_AUDIT
          return(
            I18n.t(
              "project_audit.actions.declined_project_invitation",
              person: person_name
            )
          )
        end

        return(
          I18n.t(
            "project_audit.actions.cancelled_project_invitation",
            user: user_display,
            person: person_name
          )
        )
      end

      if member_left?
        return(
          I18n.t(
            "project_audit.actions.member_left_project",
            person: person_name
          )
        )
      end

      I18n.t(
        "project_audit.actions.removed_project_member",
        user: user_display,
        person: person_name
      )
    end

    def update_sentence
      return accepted if user_id_assigned?
      return resent if changes.key?("invitation_sent_at") && pending_invite?

      parts = []
      if changes.key?("access")
        parts << enum_sentence(
          "project_audit.actions.changed_member_access",
          ProjectMembership.accesses,
          "project_membership.access",
          "access"
        )
      end
      if changes.key?("contact_designation")
        parts << enum_sentence(
          "project_audit.actions.changed_member_contact",
          ProjectMembership.contact_designations,
          "project_membership.contact_designation",
          "contact_designation"
        )
      end
      parts << role_change if changes.key?("role_tags")
      return parts.join(". ") if parts.any?

      fallback
    end

    def accepted
      I18n.t(
        "project_audit.actions.accepted_project_invitation",
        person: person_name
      )
    end

    def resent
      I18n.t(
        "project_audit.actions.resent_project_invitation",
        user: user_display,
        person: person_name
      )
    end

    def enum_sentence(action_key, enum_hash, label_prefix, attribute_key)
      old_value, new_value = Array(changes[attribute_key])
      from_label, to_label =
        enum_change_labels(enum_hash, label_prefix, old_value, new_value)

      I18n.t(
        action_key,
        user: user_display,
        person: person_name,
        from: from_label,
        to: to_label
      )
    end

    def role_change
      from_names, to_names = Array(changes["role_tags"])
      I18n.t(
        "project_audit.actions.changed_member_roles",
        user: user_display,
        person: person_name,
        from: role_phrase(from_names),
        to: role_phrase(to_names)
      )
    end

    def role_phrase(names)
      list = Array(names).map(&:to_s).compact_blank
      return I18n.t("project_audit.values.none") if list.empty?

      list.join(", ")
    end

    def user_id_assigned?
      old_id, new_id = Array(changes["user_id"])
      old_id.blank? && new_id.present?
    end

    # An access change does not repeat user_id. A destroy snapshot always has it.
    def pending_invite?
      return text_value("user_id").blank? if changes.key?("user_id")

      audit.auditable.try(:user_id).blank?
    end

    def member_left?
      actor_id = audit.user.try(:id)
      member_id = text_value("user_id")
      actor_id.present? && member_id.present? && actor_id == member_id
    end

    def person_name
      text_value("person_name").presence ||
        audit.auditable.try(:display_name).presence || "someone"
    end

    def text_value(key)
      value = changes[key]
      value.is_a?(Array) ? value.last : value
    end

    def project
      return audit.associated if audit.associated_type == "PermitProject"

      audit.auditable.try(:permit_project)
    end

    def fallback
      I18n.t("project_audit.fallback.generic_change", user: user_display)
    end
  end
end
