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

    def initialize(input_path)
      @input_path = input_path
      @site_configuration_id = SiteConfiguration.first&.id
      @classification_id_map = {}
    end

    def call
      unless ENV["IMPORT_ENABLED"] == "true"
        puts "IMPORT NOT ENABLED, PLEASE SET IMPORT_ENABLED=true IN ENV" and
          return
      end

      # Wrap the entire import process in a transaction
      ActiveRecord::Base.transaction do
        prepare_classification_map
        wipe_data!

        Zip::File.open(@input_path) do |zip_file|
          IMPORT_ORDER.each { |config| import_model(zip_file, config) }
        end

        # Post-import: Update orphaned dependents if any were preserved but need remapping
        # (Though we wiped most things, if we kept any that reference PermitType, we'd fix them here)

        reindex_models

        Rails.logger.info "Import completed from #{@input_path}"
      rescue StandardError => e
        Rails.logger.error "Import failed: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        raise ActiveRecord::Rollback
      end
    end

    private

    def reindex_models
      RequirementBlock.reindex
      RequirementTemplate.reindex
    end

    def prepare_classification_map
      # Store code -> id map to restore relationships later
      # But wait - if we are wiping classifications, we are bringing in NEW ids from the export.
      # The problem is existing records (like PermitTypeRequiredStep) point to OLD ids.
      # Strategy:
      # 1. Read existing classifications: { 'low_density' => 'old_uuid_1' }
      # 2. We can't keep 'old_uuid_1' because the export has 'new_uuid_2'.
      # 3. If we change the ID in PermitClassification, we break the FK in PermitTypeRequiredStep.
      # 4. So we must UPDATE PermitTypeRequiredStep to point to 'new_uuid_2' instead of 'old_uuid_1'.

      # Step 1: Build map of { code => old_id }
      @old_classification_map = PermitClassification.pluck(:code, :id).to_h
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

      # 5. PermitClassification Dependents - PRESERVE - fix up is handled by handle_classification_upsert
      # PermitTypeRequiredStep.destroy_all  <-- Preserving
      # PermitTypeSubmissionContact.destroy_all <-- Preserving

      # 6. PermitClassifications
      # If we are keeping children, we cannot delete the parents (classifications)
      # without violating FK constraints.
      # So we skip deletion here. The import step will use `handle_classification_upsert`
      # to update them in place or insert new ones.
      # PermitClassification.destroy_all <-- SKIPPING to avoid FK violation

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

        # If this is PermitClassification, track the mapping from Old ID to New ID
        if model_class == PermitClassification
          track_classification_id_change(attributes)
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

    def track_classification_id_change(attributes)
      code = attributes["code"]
      new_id = attributes["id"]
      old_id = @old_classification_map[code]

      return unless old_id && new_id && old_id != new_id

      # Update dependent tables immediately or defer?
      # Since we already deleted the parent (PermitClassification), the children might be in a bad state
      # (FK violation?) unless we disabled FK checks or they are nullable.
      # Wait - if we deleted PermitClassification, Postgres would have thrown FK violation
      # unless we removed dependent rows.
      #
      # The user asked: "instead of destroying these, can we just update them to use the classification on the same code"
      # This implies we should NOT have deleted the PermitClassification rows if we wanted to keep the children.
      # BUT we need to import the export's PermitClassifications which might have different IDs.
      #
      # Alternative Strategy (Cleaner):
      # 1. Don't delete PermitClassification.
      # 2. When importing PermitClassification, look up by CODE.
      # 3. If found, UPDATE the record (keeping the OLD ID).
      # 4. If not found, INSERT (using the new ID).
      # 5. If we keep the OLD ID, we don't need to update children.
      # 6. BUT existing templates in the export reference the NEW ID. So we must map Export-ID -> Local-ID.

      @classification_id_map[new_id] = old_id || new_id
    end

    def upsert_batch(model_class, records)
      if model_class == PermitClassification
        # Special handling for Classifications to preserve existing IDs
        handle_classification_upsert(records)
      else
        model_class.upsert_all(records, unique_by: :id)
      end
    end

    def handle_classification_upsert(records)
      # For classifications, we prefer to KEEP the local ID if the code matches,
      # so that local children (PermitTypeRequiredStep) remain valid.
      # However, the incoming records have specific IDs from the export.

      records.each do |attrs|
        code = attrs["code"]
        export_id = attrs["id"]

        existing_record = PermitClassification.find_by(code: code)

        if existing_record
          # We keep the existing record's ID.
          # We assume the export's other attributes (name, etc) should overwrite local ones.
          # We DO NOT update the ID.
          attrs["id"] = existing_record.id
          existing_record.update!(attrs.except("id", "created_at"))

          # Map Export ID -> Local ID for other tables
          @classification_id_map[export_id] = existing_record.id
        else
          # New classification, insert as is
          PermitClassification.create!(attrs)
          @classification_id_map[export_id] = export_id
        end
      end
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

        if attributes.key?("site_configuration_id") && @site_configuration_id
          attributes["site_configuration_id"] = @site_configuration_id
        end

        # Remap Classification IDs
        if @classification_id_map.any?
          attributes["permit_type_id"] = @classification_id_map[
            attributes["permit_type_id"]
          ] || attributes["permit_type_id"]
          attributes["activity_id"] = @classification_id_map[
            attributes["activity_id"]
          ] || attributes["activity_id"]
        end
      end

      # TemplateVersion fixups
      if model_class == TemplateVersion
        attributes["deprecated_by_id"] = nil

        # FIX: Remap baked-in permitType ID in denormalized_template_json
        if @classification_id_map.any? &&
             attributes["denormalized_template_json"].is_a?(Hash)
          json = attributes["denormalized_template_json"]

          # Remap permitType.id if present
          if json["permit_type"].is_a?(Hash) && json["permit_type"]["id"]
            old_pt_id = json["permit_type"]["id"]
            new_pt_id = @classification_id_map[old_pt_id]
            json["permit_type"]["id"] = new_pt_id if new_pt_id
          end

          # Remap activity.id if present
          if json["activity"].is_a?(Hash) && json["activity"]["id"]
            old_act_id = json["activity"]["id"]
            new_act_id = @classification_id_map[old_act_id]
            json["activity"]["id"] = new_act_id if new_act_id
          end

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
