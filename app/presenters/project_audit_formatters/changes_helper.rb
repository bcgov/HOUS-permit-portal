module ProjectAuditFormatters
  module ChangesHelper
    private

    def enum_change_labels(enum_hash, label_prefix, old_value, new_value)
      [
        enum_label(enum_hash, label_prefix, old_value),
        enum_label(enum_hash, label_prefix, new_value)
      ]
    end

    def enum_label(enum_hash, label_prefix, value)
      return I18n.t("project_audit.values.unknown") if value.nil?

      key = (value.is_a?(Integer) ? enum_hash.key(value) : value.to_s)

      return I18n.t("project_audit.values.unknown") if key.blank?

      I18n.t(
        "project_audit.values.#{label_prefix}.#{key}",
        default: key.humanize
      )
    end

    def viewed_at_marked_read?(key = "viewed_at")
      old_value, new_value = Array(changes[key])
      old_value.blank? && new_value.present?
    end

    def viewed_at_marked_unread?(key = "viewed_at")
      old_value, new_value = Array(changes[key])
      old_value.present? && new_value.blank?
    end

    def format_enum_change(action_key, enum_hash, label_prefix, attribute_key)
      old_value, new_value = Array(changes[attribute_key])
      from_label, to_label =
        enum_change_labels(enum_hash, label_prefix, old_value, new_value)

      I18n.t(action_key, user: user_display, from: from_label, to: to_label)
    end

    def format_viewed_at_change(read_key, unread_key)
      if viewed_at_marked_read?
        I18n.t(read_key, user: user_display)
      elsif viewed_at_marked_unread?
        I18n.t(unread_key, user: user_display)
      end
    end
  end
end
