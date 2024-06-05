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
    records_with_existing_mapping =
      JurisdictionIntegrationRequirementsMapping
        .joins(:template_version)
        .where(jurisdiction: jurisdiction)
        .where.not(id: id)
        .where(
          "requirements_mapping -> :requirement_block_sku -> 'requirements' -> :requirement_code ->> 'local_system_mapping' IS NOT NULL AND " \
            "requirements_mapping -> :requirement_block_sku -> 'requirements' -> :requirement_code ->> 'local_system_mapping' <> ''",
          requirement_block_sku: requirement_block_sku,
          requirement_code: requirement_code,
        )
        .order("template_versions.version_date DESC")

    return nil if records_with_existing_mapping.empty?

    records_with_published_template_version =
      records_with_existing_mapping.joins(:template_version).where(template_versions: { status: "published" })

    # prefer the record with a published template version with the same requirement template
    # if it exists, otherwise return the first record with any published template version
    record_with_preferred_published_template_version =
      records_with_published_template_version
        .joins(:template_version)
        .where(template_versions: { requirement_template_id: template_version.requirement_template_id })
        .first || records_with_published_template_version.first

    # binding.pry if requirement_code == "code4"

    # return the first record with a preferred published template version if it exists, otherwise return the first record
    record_with_preferred_published_template_version ||
      records_with_existing_mapping
        .joins(:template_version)
        .where(template_versions: { requirement_template_id: template_version.requirement_template_id })
        .first || records_with_existing_mapping.first
  end

  private

  # This method is used to initialize the requirements mapping for a new record.
  # It copies existing requirements mapping from existing records with the same jurisdiction
  def initialize_requirements_mapping
    return unless requirements_mapping.empty?

    new_mappings = {}

    # iterate over each requirement block blueprint in the template version
    template_version.requirement_blocks_json.each do |requirement_block_id, requirement_block_blueprint|
      requirements = requirement_block_blueprint["requirements"]
      next if requirements.blank?

      requirement_block_sku = requirement_block_blueprint["sku"]

      new_mappings[requirement_block_sku] = { "id" => requirement_block_id, "requirements" => {} } unless new_mappings[
        requirement_block_sku
      ].present?

      requirements.each do |requirement_blueprint|
        requirement_id = requirement_blueprint["id"]
        requirement_code = requirement_blueprint["requirement_code"]
        copyable_existing_mapping =
          copyable_record_with_existing_mapping(requirement_block_sku, requirement_code)&.requirements_mapping || {}
        new_mappings[requirement_block_sku]["requirements"][requirement_code] = {
          "id" => requirement_id,
          "local_system_mapping" =>
            copyable_existing_mapping.dig(
              requirement_block_sku,
              "requirements",
              requirement_code,
              "local_system_mapping",
            ) || "",
        }
      end
    end

    self.requirements_mapping = new_mappings
  end
end
