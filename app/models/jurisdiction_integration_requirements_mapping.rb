class JurisdictionIntegrationRequirementsMapping < ApplicationRecord
  # The JurisdictionIntegrationRequirementsMapping model represents the mapping
  # between jurisdictions local system fields and template versions fields.

  # The schema of the request_mapping is as follows:
  # {
  #  [requirement_block_sku]: {
  #   id: [requirement_block_id],
  #  requirements: {
  #   [requirement_code]: {
  #   id: [requirement_id],
  #  local_system_mapping: local_system_field_attribute}
  # }
  belongs_to :jurisdiction
  belongs_to :template_version

  validates_uniqueness_of :template_version_id, scope: :jurisdiction_id

  before_create :initialize_requirements_mapping

  after_save :sync_changes_with_other_currently_active_mappings

  attr_accessor :simplified_map_to_sync

  # Updates the requirements mapping of the current model instance.
  # This method takes a simplified map of the requirements and updates the existing mapping accordingly.
  # The simplified map should be a hash where each key is a requirement block SKU and the value is another hash.
  # The inner hash should have requirement codes as keys and local system mapping as values.
  #
  # Unless explicitly ignored, the method will also set the simplified_map_to_sync attribute to the given simplified_map,
  # which will be used to sync the changes with other currently active mappings.
  #
  # Note: mappings which does now exist in the original mapping will not be created.
  # @param simplified_map [Hash] the simplified map of requirements
  # @param skip_sync [Boolean] whether to ignore syncing the changes with other currently active mappings
  # @return [Boolean] true if the update was successful, false otherwise
  def update_requirements_mapping(simplified_map, skip_sync = false)
    self.with_lock do
      new_requirements_mapping =
        JurisdictionIntegrationRequirementsMappingService.new(self).get_updated_requirements_mapping(simplified_map)

      unless new_requirements_mapping.blank? || self.requirements_mapping == new_requirements_mapping
        self.simplified_map_to_sync = simplified_map unless skip_sync
        self.requirements_mapping = new_requirements_mapping

        return self.save
      end
    end

    false
  end

  # This method is used to return a copyable record with existing mapping
  # for a given requirement block sku and requirement code.
  # It returns the first record with a published template version if it exists,
  # otherwise it returns the first record.
  #
  # @param requirement_block_sku [String] the sku of the requirement block
  # @param requirement_code [String] the code of the requirement
  #
  # @return [JurisdictionIntegrationRequirementsMapping] the copyable record with existing mapping

  def copyable_record_with_existing_mapping(requirement_block_sku, requirement_code)
    JurisdictionIntegrationRequirementsMappingService.new(self).copyable_record_with_existing_mapping(
      requirement_block_sku,
      requirement_code,
    )
  end

  private

  def initialize_requirements_mapping
    JurisdictionIntegrationRequirementsMappingService.new(self).initialize_requirements_mapping!
  end

  # Synchronizes changes with other currently active mappings for published template versions.
  # This method is called after the requirements mapping of the current instance is updated.
  # It iterates over all other active mappings for the same jurisdiction that are associated with a published template version.
  # For each of these mappings, it updates their requirements mapping with the simplified map of the current instance.
  # The simplified map is a hash where each key is a requirement block SKU and the value is another hash.
  # The inner hash has requirement codes as keys and local system mapping as values.
  # The method ignores the current instance during this process and also marks the other mapping to not do the same syncing process.
  # Note: This method does nothing if the simplified map to sync is not present or is not a hash.
  #
  # @return [void]
  def sync_changes_with_other_currently_active_mappings
    return unless simplified_map_to_sync.present? && simplified_map_to_sync.is_a?(Hash)

    active_mappings =
      JurisdictionIntegrationRequirementsMapping
        .joins(:template_version)
        .where(jurisdiction_id: jurisdiction_id, template_versions: { status: "published" })
        .where.not(id: id)

    active_mappings.each { |mapping| mapping.update_requirements_mapping(simplified_map_to_sync, true) }
  end
end
