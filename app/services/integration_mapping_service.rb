class IntegrationMappingService
  def initialize(integration_mapping)
    @mapping = integration_mapping
  end

  # Returns an new requirements mapping hash for the integration_mapping instance.
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
      unless requirements.is_a?(Hash) &&
               updated_mapping[requirement_block_sku].present?
        next
      end

      requirements.each do |requirement_code, local_system_mapping|
        unless updated_mapping[requirement_block_sku]["requirements"][
                 requirement_code
               ].present?
          next
        end

        updated_mapping[requirement_block_sku]["requirements"][
          requirement_code
        ][
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
  # The local system mapping is either copied from an existing mapping (in the last 25 template versions) for the same requirement block SKU and requirement code, or it is an empty string if no such mapping exists.
  # The new mapping is only created in memory and assigned to the requirements_mapping attribute of the jurisdiction integration requirements mapping instance.
  # The changes are not persisted to the database.
  # @return [void]
  def initialize_requirements_mapping!
    return unless @mapping.requirements_mapping.empty?

    new_mappings = {}
    # Fetches a consolidated requirements mapping from past 25 records
    copyable_requirements_mapping_from_past_records =
      get_consolidated_requirements_mapping_from_past_records || {}

    @mapping
      .template_version
      .requirement_blocks_json
      .each do |requirement_block_id, requirement_block_blueprint|
      requirements = requirement_block_blueprint["requirements"]
      next if requirements.blank?

      requirement_block_sku = requirement_block_blueprint["sku"]

      new_mappings[requirement_block_sku] = {
        "id" => requirement_block_id,
        "requirements" => {
        }
      } unless new_mappings[requirement_block_sku].present?

      requirements.each do |requirement_blueprint|
        requirement_id = requirement_blueprint["id"]
        requirement_code = requirement_blueprint["requirement_code"]

        new_mappings[requirement_block_sku]["requirements"][
          requirement_code
        ] = {
          "id" => requirement_id,
          "local_system_mapping" =>
            copyable_requirements_mapping_from_past_records.dig(
              requirement_block_sku,
              "requirements",
              requirement_code,
              "local_system_mapping"
            ) || ""
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
  # @return [IntegrationMapping] the copyable record with existing mapping

  def copyable_record_with_existing_mapping(
    requirement_block_sku,
    requirement_code
  )
    records_with_existing_mapping =
      fetch_records_with_existing_mapping(
        requirement_block_sku,
        requirement_code
      )
    return nil if records_with_existing_mapping.empty?

    fetch_preferred_mapping_record_for_copy(records_with_existing_mapping)
  end

  private

  # Fetches a consolidated mapping of requirements from past records.
  # This method retrieves past ordered integration mappings for a jurisdiction, up to a specified limit.
  # It then consolidates these mappings into a single mapping, prioritizing recent published matches with same requirement template.
  # The consolidated mapping is structured as a hash, and has the same shape as the requirements_mapping json for an integration_mapping instance.
  # The method returns the consolidated requirements mapping.
  #
  # @param max_past_records [Integer] The maximum number of past records to fetch (default: 25)
  # @return [Hash] The consolidated requirements mapping
  def get_consolidated_requirements_mapping_from_past_records(
    max_past_records: 25
  )
    past_records =
      fetch_ordered_integration_mappings_for_jurisdiction(
        limit: max_past_records
      )
    return {} if past_records.empty?

    consolidated_requirements_mapping = {}

    past_records.each do |past_record|
      past_record
        .requirements_mapping
        .each do |requirement_block_sku, requirement_block_mapping|
        consolidated_requirements_mapping[requirement_block_sku] ||= {
          "id" => requirement_block_mapping.dig("id"),
          "requirements" => {
          }
        }

        requirement_block_mapping
          .dig("requirements")
          &.each do |requirement_code, requirement|
            if consolidated_requirements_mapping.dig(
                 requirement_block_sku,
                 "requirements",
                 requirement_code
               ).present?
              next
            end

            consolidated_requirements_mapping[requirement_block_sku][
              "requirements"
            ][
              requirement_code
            ] = {
              "id" => requirement["id"],
              "local_system_mapping" => requirement["local_system_mapping"]
            }
          end
      end
    end

    consolidated_requirements_mapping
  end

  # Fetches and orders IntegrationMapping records for current integration mapping instance jurisdiction.
  # The method returns an ordered list of IntegrationMapping records for the same jurisdiction as the current mapping instance, excluding the current mapping instance itself.
  # The order of the records is determined by the `status` of their associated `TemplateVersion` (with 'published' coming first, then 'scheduled', and finally 'deprecated'), whether they have the same `requirement_template_id` as the current mapping instance, and their `version_date` (in descending order).
  # If a limit is provided, the method will return only up to that number of records.
  # If an offset is provided, the method will skip that number of records before starting to return the records.
  # If no limit or offset is provided, it will return all the fetched and ordered records.
  #
  # @param limit [Integer] the maximum number of records to return (optional)
  # @param offset [Integer] the number of records to skip before starting to return the records (optional)
  # @return [ActiveRecord::Relation, nil] an ordered list of IntegrationMapping records, or nil if the jurisdiction is not present
  def fetch_ordered_integration_mappings_for_jurisdiction(
    limit: nil,
    offset: nil
  )
    return unless @mapping.jurisdiction.present?

    case_statement = <<-SQL.squish
        CASE 
            WHEN template_versions.status = ? THEN 1 WHEN template_versions.status = ? THEN 2 WHEN template_versions.status = ? THEN 3 
        END,
        CASE 
            WHEN template_versions.requirement_template_id = ? THEN 1 ELSE 2 
        END, 
        template_versions.version_date DESC
    SQL
    sanitized_case_statement =
      ActiveRecord::Base.sanitize_sql_array(
        [
          case_statement,
          TemplateVersion.statuses[:published],
          TemplateVersion.statuses[:scheduled],
          TemplateVersion.statuses[:deprecated],
          @mapping.template_version.requirement_template_id
        ]
      )
    query =
      IntegrationMapping
        .joins(:template_version)
        .where(jurisdiction: @mapping.jurisdiction)
        .where.not(id: @mapping.id)
        .order(Arel.sql(sanitized_case_statement))

    query = query.limit(limit) if limit.present?
    query = query.offset(offset) if offset.present?

    query
  end

  def fetch_records_with_existing_mapping(
    requirement_block_sku,
    requirement_code
  )
    IntegrationMapping
      .joins(:template_version)
      .where(jurisdiction: @mapping.jurisdiction)
      .where.not(id: @mapping.id)
      .where(
        "requirements_mapping -> :requirement_block_sku -> 'requirements' -> :requirement_code ->> 'local_system_mapping' IS NOT NULL AND " \
          "requirements_mapping -> :requirement_block_sku -> 'requirements' -> :requirement_code ->> 'local_system_mapping' <> ''",
        requirement_block_sku: requirement_block_sku,
        requirement_code: requirement_code
      )
      .order("template_versions.version_date DESC")
  end

  def fetch_preferred_mapping_record_for_copy(records_with_existing_mapping)
    records_with_published_template_version =
      records_with_existing_mapping.joins(:template_version).where(
        template_versions: {
          status: "published"
        }
      )

    # prefer the record with a published template version with the same requirement template
    # if it exists, otherwise return the first record with any published template version
    record_with_preferred_published_template_version =
      records_with_published_template_version
        .joins(:template_version)
        .where(
          template_versions: {
            requirement_template_id:
              @mapping.template_version.requirement_template_id
          }
        )
        .first || records_with_published_template_version.first

    # return the first record with a preferred published template version if it exists, otherwise return the first record
    record_with_preferred_published_template_version ||
      records_with_existing_mapping
        .joins(:template_version)
        .where(
          template_versions: {
            requirement_template_id:
              @mapping.template_version.requirement_template_id
          }
        )
        .first || records_with_existing_mapping.first
  end
end
