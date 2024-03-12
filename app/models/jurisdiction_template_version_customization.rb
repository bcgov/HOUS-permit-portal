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
end
