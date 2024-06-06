class JurisdictionIntegrationRequirementsMappingService
  def initialize(jurisdiction_integration_requirements_mapping)
    @mapping = jurisdiction_integration_requirements_mapping
  end

  # Returns an new requirements mapping hash for the jurisdiction_integration_requirements_mapping instance.
  # This method takes a simplified map of the requirements and returns an updated requirements mapping hash.
  # The simplified map should be a hash where each key is a requirement block SKU and the value is another hash.
  # The inner hash should have requirement codes as keys and local system mapping as values.
  # Note: mappings which does now exist in the original mapping will not be added to the returned hash.
  # @param simplified_map [Hash] the simplified map of requirements
  # @return requirement_mapping [HASH] updated requirements mapping hash
  def get_updated_requirements_mapping(simplified_map)
    return unless simplified_map.is_a?(Hash)

    updated_mapping = @mapping.requirements_mapping.deep_dup

    simplified_map.each do |requirement_block_sku, requirements|
      next unless requirements.is_a?(Hash) && updated_mapping[requirement_block_sku].present?

      requirements.each do |requirement_code, local_system_mapping|
        next unless updated_mapping[requirement_block_sku]["requirements"][requirement_code].present?

        updated_mapping[requirement_block_sku]["requirements"][requirement_code][
          "local_system_mapping"
        ] = local_system_mapping
      end
    end

    updated_mapping
  end

  # Initializes the requirements mapping of the jurisdiction integration requirements mapping instance.
  # This method is called when the requirements mapping is empty.
  # It creates a new mapping based on the requirement blocks and requirements in the template version associated with the jurisdiction integration requirements mapping instance.
  # For each requirement block in the template version, it creates a new entry in the mapping with the SKU of the requirement block as the key.
  # For each requirement in the requirement block, it creates a new entry in the inner hash with the requirement code as the key.
  # The value of the inner entry is another hash with the ID of the requirement and the local system mapping.
  # The local system mapping is either copied from an existing mapping for the same requirement block SKU and requirement code, or it is an empty string if no such mapping exists.
  # The new mapping is only created in memory and assigned to the requirements_mapping attribute of the jurisdiction integration requirements mapping instance.
  # The changes are not persisted to the database.
  # @return [void]
  def initialize_requirements_mapping!
    return unless @mapping.requirements_mapping.empty?

    new_mappings = {}

    @mapping.template_version.requirement_blocks_json.each do |requirement_block_id, requirement_block_blueprint|
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

    @mapping.requirements_mapping = new_mappings
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
    records_with_existing_mapping = fetch_records_with_existing_mapping(requirement_block_sku, requirement_code)
    return nil if records_with_existing_mapping.empty?

    fetch_preferred_mapping_record_for_copy(records_with_existing_mapping)
  end

  private

  def fetch_records_with_existing_mapping(requirement_block_sku, requirement_code)
    JurisdictionIntegrationRequirementsMapping
      .joins(:template_version)
      .where(jurisdiction: @mapping.jurisdiction)
      .where.not(id: @mapping.id)
      .where(
        "requirements_mapping -> :requirement_block_sku -> 'requirements' -> :requirement_code ->> 'local_system_mapping' IS NOT NULL AND " \
          "requirements_mapping -> :requirement_block_sku -> 'requirements' -> :requirement_code ->> 'local_system_mapping' <> ''",
        requirement_block_sku: requirement_block_sku,
        requirement_code: requirement_code,
      )
      .order("template_versions.version_date DESC")
  end

  def fetch_preferred_mapping_record_for_copy(records_with_existing_mapping)
    records_with_published_template_version =
      records_with_existing_mapping.joins(:template_version).where(template_versions: { status: "published" })

    # prefer the record with a published template version with the same requirement template
    # if it exists, otherwise return the first record with any published template version
    record_with_preferred_published_template_version =
      records_with_published_template_version
        .joins(:template_version)
        .where(template_versions: { requirement_template_id: @mapping.template_version.requirement_template_id })
        .first || records_with_published_template_version.first

    # return the first record with a preferred published template version if it exists, otherwise return the first record
    record_with_preferred_published_template_version ||
      records_with_existing_mapping
        .joins(:template_version)
        .where(template_versions: { requirement_template_id: @mapping.template_version.requirement_template_id })
        .first || records_with_existing_mapping.first
  end
end
