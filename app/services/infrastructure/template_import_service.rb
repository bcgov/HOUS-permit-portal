require "zip"

module Infrastructure
  class TemplateImportService
    IMPORT_ORDER = [
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

    def initialize(input_path)
      @input_path = input_path
      @site_configuration_id = SiteConfiguration.first&.id
    end

    def call
      unless ENV["IMPORT_ENABLED"] == "true"
        puts "IMPORT NOT ENABLED, PLEASE SET IMPORT_ENABLED=true IN ENV"
        return
      end

      # Wrap the entire import process in a transaction
      ActiveRecord::Base.transaction do
        wipe_data!

        Zip::File.open(@input_path) do |zip_file|
          IMPORT_ORDER.each { |config| import_model(zip_file, config) }
        end

        Rails.logger.info "Import completed from #{@input_path}"
      rescue StandardError => e
        Rails.logger.error "Import failed: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        raise ActiveRecord::Rollback
      end

      reindex_models
    end

    private

    def reindex_models
      RequirementBlock.reindex
      RequirementTemplate.reindex
    end

    def wipe_data!
      Rails.logger.info "Wiping data..."

      # 1. Submission Data & Collaborations
      SubmissionVersion.destroy_all
      PermitCollaboration.destroy_all
      PermitBlockStatus.destroy_all
      SupportingDocument.destroy_all

      StepCode.destroy_all

      # 2. Permit Applications
      PermitApplication.destroy_all

      # 3. Pre-Checks
      DesignDocument.destroy_all
      PreCheck.destroy_all

      # 3.5. Jurisdiction Customizations (Dependent on TemplateVersion)
      JurisdictionTemplateVersionCustomization.destroy_all
      IntegrationMapping.destroy_all
      IntegrationMappingNotification.destroy_all

      # 4. Template-related
      RequirementDocument.destroy_all
      TemplateVersion.destroy_all
      Requirement.destroy_all
      TemplateSectionBlock.destroy_all
      RequirementTemplateSection.destroy_all
      RequirementTemplate.destroy_all
      RequirementBlock.destroy_all

      # Tagging cleanup
      ActsAsTaggableOn::Tagging.destroy_all
      ActsAsTaggableOn::Tag.destroy_all

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

        # Skip if fixups returned nil (orphaned record)
        next if attributes.nil?

        # Handle Self-Referential FKs
        if self_ref_col && attributes[self_ref_col].present?
          deferred_updates << {
            :id => attributes["id"],
            self_ref_col => attributes[self_ref_col]
          }
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
    end

    def upsert_batch(model_class, records)
      model_class.upsert_all(records, unique_by: :id)
    end

    def process_deferred_updates(model_class, updates)
      updates.each do |update|
        model_class.where(id: update[:id]).update_all(update)
      end
    end

    def apply_fixups(model_class, attributes)
      # Sanitize unknown attributes if present (e.g. from ActsAsTaggableOn or virtual attrs)
      attributes.delete("association_list") if model_class == RequirementBlock

      # RequirementTemplate fixups
      if model_class == RequirementTemplate
        attributes["assignee_id"] = nil
        attributes.delete("permit_type_id")
        attributes.delete("activity_id")
        attributes.delete("first_nations")

        if attributes.key?("site_configuration_id") && @site_configuration_id
          attributes["site_configuration_id"] = @site_configuration_id
        end
      end

      # TemplateVersion fixups
      if model_class == TemplateVersion
        attributes["deprecated_by_id"] = nil

        if attributes["denormalized_template_json"].is_a?(Hash)
          json = attributes["denormalized_template_json"]
          json.delete("permit_type")
          json.delete("permitType")
          json.delete("activity")
          json.delete("first_nations")
          json.delete("firstNations")
          attributes["denormalized_template_json"] = json
        end
      end

      # TemplateSectionBlock fixups (Orphan check)
      if model_class == TemplateSectionBlock
        # Check parent section existence
        unless RequirementTemplateSection.exists?(
                 attributes["requirement_template_section_id"]
               )
          Rails.logger.warn "Skipping TemplateSectionBlock #{attributes["id"]} - Section #{attributes["requirement_template_section_id"]} missing"
          return nil
        end

        # Check requirement block existence
        unless RequirementBlock.exists?(attributes["requirement_block_id"])
          Rails.logger.warn "Skipping TemplateSectionBlock #{attributes["id"]} - Block #{attributes["requirement_block_id"]} missing"
          return nil
        end
      end

      # Requirement fixups (Orphan check)
      if model_class == Requirement
        # Check parent requirement block existence
        unless RequirementBlock.exists?(attributes["requirement_block_id"])
          Rails.logger.warn "Skipping Requirement #{attributes["id"]} - Block #{attributes["requirement_block_id"]} missing"
          return nil
        end
      end

      attributes
    end
  end
end
