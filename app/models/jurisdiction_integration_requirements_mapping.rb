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
    JurisdictionIntegrationRequirementsMappingService.new(self).initialize_requirements_mapping
  end
end
