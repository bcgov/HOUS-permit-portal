require "zip"

module Infrastructure
  class TemplateImportService
    IMPORT_ORDER = [
      {
        model: PermitClassification,
        filename: "permit_classifications.ndjson"
      },
      { model: RequirementBlock, filename: "requirement_blocks.ndjson" },
      {
        model: RequirementTemplate,
        filename: "requirement_templates.ndjson",
        self_ref: "copied_from_id"
      },
      {
        model: RequirementTemplateSection,
        filename: "requirement_template_sections.ndjson",
        self_ref: "copied_from_id"
      },
      {
        model: TemplateSectionBlock,
        filename: "template_section_blocks.ndjson"
      },
      { model: Requirement, filename: "requirements.ndjson" },
      { model: TemplateVersion, filename: "template_versions.ndjson" },
      { model: RequirementDocument, filename: "requirement_documents.ndjson" },
      { model: ActsAsTaggableOn::Tag, filename: "tags.ndjson" },
      { model: ActsAsTaggableOn::Tagging, filename: "taggings.ndjson" }
    ]

    def initialize(input_path, wipe_data: false)
      @input_path = input_path
      @wipe_data = wipe_data
      @site_configuration_id = SiteConfiguration.first&.id
    end

    def call
      wipe_data! if @wipe_data

      Zip::File.open(@input_path) do |zip_file|
        IMPORT_ORDER.each { |config| import_model(zip_file, config) }
      end

      Rails.logger.info "Import completed from #{@input_path}"
    end

    private

    def wipe_data!
      Rails.logger.info "Wiping data..."

      # Cascading delete for PermitApplication first as it depends on Templates
      # Using destroy_all to ensure callbacks/associations (like S3 files) are cleaned up if possible
      # But for speed in 'wipe' mode, we might want delete_all.
      # Given schema: has_many :submission_versions, dependent: :destroy
      # We should try destroy_all to clean up nested objects.
      PermitApplication.destroy_all

      # Wipe in reverse dependency order
      RequirementDocument.delete_all
      TemplateVersion.delete_all
      Requirement.delete_all
      TemplateSectionBlock.delete_all
      RequirementTemplateSection.delete_all
      RequirementTemplate.delete_all
      RequirementBlock.delete_all
      # We generally preserve PermitClassifications as they might be shared/seeded,
      # but if they are in the export, upsert will update them.

      # Tagging cleanup
      ActsAsTaggableOn::Tagging.delete_all
      ActsAsTaggableOn::Tag.delete_all

      Rails.logger.info "Data wiped."
    end

    def import_model(zip_file, config)
      filename = config[:filename]
      model_class = config[:model]
      self_ref_col = config[:self_ref]

      entry = zip_file.find_entry(filename)
      unless entry
        Rails.logger.warn "Entry #{filename} not found in zip. Skipping."
        return
      end

      records_batch = []
      deferred_updates = []

      entry.get_input_stream.each_line do |line|
        attributes = JSON.parse(line)

        # FIXUPS
        attributes = apply_fixups(model_class, attributes)

        # Handle Self-Referential FKs
        if self_ref_col && attributes[self_ref_col].present?
          # Store ID and Parent ID for second pass
          deferred_updates << {
            :id => attributes["id"],
            self_ref_col => attributes[self_ref_col]
          }
          # Nullify for first pass
          attributes[self_ref_col] = nil
        end

        records_batch << attributes

        if records_batch.size >= 1000
          upsert_batch(model_class, records_batch)
          records_batch = []
        end
      end

      upsert_batch(model_class, records_batch) if records_batch.any?

      # Second pass for self-refs
      if deferred_updates.any?
        process_deferred_updates(model_class, deferred_updates)
      end

      Rails.logger.info "Imported #{filename}"
    rescue NameError
      Rails.logger.warn "Model for #{filename} not found. Skipping."
    end

    def upsert_batch(model_class, records)
      # upsert_all requires unique_by. Assuming 'id' is primary key.
      # timestamps might be in the attributes, which is good.
      model_class.upsert_all(records, unique_by: :id)
    end

    def process_deferred_updates(model_class, updates)
      # We can update in batches or one by one.
      # Update one by one is safer for simple implementation,
      # or update_all with case statement for speed (complicated).
      # Let's do batch update if possible, or simple loop.
      # Rails 7 doesn't have a simple batch update for different values.
      # We will loop.
      updates.each do |update|
        model_class.where(id: update[:id]).update_all(update)
      end
    end

    def apply_fixups(model_class, attributes)
      # RequirementTemplate fixups
      if model_class == RequirementTemplate
        # Fix assignee_id (User) - set to nil as User might not exist
        attributes["assignee_id"] = nil

        # Fix site_configuration_id - map to local env's config
        if attributes.key?("site_configuration_id") && @site_configuration_id
          attributes["site_configuration_id"] = @site_configuration_id
        end
      end

      # TemplateVersion fixups
      if model_class == TemplateVersion
        # Fix deprecated_by_id (User) - set to nil
        attributes["deprecated_by_id"] = nil
      end

      attributes
    end
  end
end
