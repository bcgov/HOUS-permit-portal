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

  validate :ensure_reason_set_for_enabled_elective_fields

  ACCEPTED_ENABLED_ELECTIVE_FIELD_REASONS = %w[bylaw policy zoning].freeze

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
            "model_validation.jurisdiction_template_version_customization
.enabled_elective_field_reason_incorrect",
            accepted_reasons: ACCEPTED_ENABLED_ELECTIVE_FIELD_REASONS.join(", "),
          ),
        )
      end
    end
  end
end
