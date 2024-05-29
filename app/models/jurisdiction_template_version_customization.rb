class JurisdictionTemplateVersionCustomization < ApplicationRecord
  # The expected schema of the :customizations json is the following
  # {
  #   requirement_block_changes?: Record<UUID, {
  #     tip?: string
  #     enabled_elective_field_ids?: Array<UUID>
  #   }>
  # }
  # Where the key to requirement_block_changes object is the id of the requirement_block affected.
  # Where the elective_fields are the ids of the requirement_fields that are elective and have been
  # enabled
  belongs_to :jurisdiction
  belongs_to :template_version

  before_save :sanitize_tip
  validates_uniqueness_of :template_version_id, scope: :jurisdiction_id
  after_commit :reindex_jurisdiction_templates_used_size
  after_commit :publish_customization_event, on: %i[create update]

  validate :ensure_reason_set_for_enabled_elective_fields

  ACCEPTED_ENABLED_ELECTIVE_FIELD_REASONS = %w[bylaw policy zoning].freeze

  def create_update_event_notification_data(saved_changes)
    # Determine the new and removed IDs
    added_ids = []
    removed_ids = []

    # Iterate through all requirement_block_changes
    old_requirement_block_changes = saved_changes.dig("customizations", 0, "requirement_block_changes") || {}
    new_requirement_block_changes = saved_changes.dig("customizations", 1, "requirement_block_changes") || {}

    new_requirement_block_changes.each_key do |key|
      old_values = old_requirement_block_changes.dig(key, "enabled_elective_field_ids") || []
      new_values = new_requirement_block_changes.dig(key, "enabled_elective_field_ids") || []

      added_ids.concat(new_values - old_values)
      removed_ids.concat(old_values - new_values)
    end

    # Determine the correspoinding form_json data for each of the IDs
    added_components = []
    removed_components = []

    template_version.form_json["components"].each do |section|
      section["components"].each do |block|
        block["components"].each do |requirement|
          if added_ids.include?(requirement["id"])
            added_components.push(requirement)
          elsif removed_ids.include?(requirement["id"])
            removed_components.push(requirement)
          end
        end
      end
    end

    def format_components(components)
      components.map do |component|
        { "label" => component["label"], "key" => component["key"], "id" => component["id"] }
      end
    end

    formatted_elective_changes = {
      enabled: format_components(added_components),
      disabled: format_components(removed_components),
    }
    binding.pry
    {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::CUSTOMIZATION_UPDATE,
      "action_text" =>
        "#{I18n.t("notification.template_version.new_customization_notification", jurisdiction_name: jurisdiction.qualified_name, template_label: template_version.label)}",
      "object_data" => {
        "template_version_id" => template_version.id,
        "formatted_elective_changes" => formatted_elective_changes,
      },
    }
  end

  def label
    "#{jurisdiction.name} #{template_version.label}"
  end

  def self.requirement_count_by_reason(requirement_block_id, requirement_id, reason)
    return 0 unless ACCEPTED_ENABLED_ELECTIVE_FIELD_REASONS.include?(reason)

    JurisdictionTemplateVersionCustomization
      .joins(:template_version)
      .where(template_versions: { status: "published" })
      .where(
        "customizations -> 'requirement_block_changes' -> :requirement_block_id -> 'enabled_elective_field_ids' @> :id",
        requirement_block_id: requirement_block_id,
        id: "[\"#{requirement_id}\"]",
      )
      .select do |jtvc|
        jtvc
          .customizations
          .dig("requirement_block_changes", requirement_block_id, "enabled_elective_field_reasons")
          &.values
          &.include?(reason)
      end
      .count
  end

  def self.count_of_jurisdictions_using_requirement(requirement_block_id, requirement_id)
    JurisdictionTemplateVersionCustomization
      .joins(:template_version)
      .where(template_versions: { status: "published" })
      .where(
        "customizations -> 'requirement_block_changes' -> :requirement_block_id -> 'enabled_elective_field_ids' @> :id",
        requirement_block_id: requirement_block_id,
        id: "[\"#{requirement_id}\"]",
      )
      .count
  end

  private

  def reindex_jurisdiction_templates_used_size
    return unless jurisdiction.present?
    return unless new_record? || destroyed? || saved_change_to_jurisdiction_id?

    jurisdiction.reindex
  end

  def sanitize_tip
    return if customizations.blank? || customizations["requirement_block_changes"].blank?

    customizations["requirement_block_changes"].each do |key, value|
      next if value["tip"].blank?
      customizations["requirement_block_changes"][key]["tip"] = ActionController::Base.helpers.sanitize(value["tip"])
    end
  end

  def ensure_reason_set_for_enabled_elective_fields
    return if customizations.blank? || customizations["requirement_block_changes"].blank?

    customizations["requirement_block_changes"].each do |_key, value|
      next if value["enabled_elective_field_ids"].blank?

      any_missing_or_incorrect_reason =
        value["enabled_elective_field_ids"].any? do |field_id|
          return true if value["enabled_elective_field_reasons"].blank?

          value["enabled_elective_field_reasons"][field_id].blank? ||
            ACCEPTED_ENABLED_ELECTIVE_FIELD_REASONS.none? do |reason|
              reason == value["enabled_elective_field_reasons"][field_id]
            end
        end

      if any_missing_or_incorrect_reason
        errors.add(
          :customizations,
          I18n.t(
            "model_validation.jurisdiction_template_version_customization.enabled_elective_field_reason_incorrect",
            accepted_reasons: ACCEPTED_ENABLED_ELECTIVE_FIELD_REASONS.join(", "),
          ),
        )
      end
    end
  end

  def publish_customization_event
    NotificationService.publish_customization_create_update_event(self, saved_changes)
  end
end
