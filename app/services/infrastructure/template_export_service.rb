require "zip"

module Infrastructure
  class TemplateExportService
    MANIFEST_FILENAME = "manifest.json"

    MODELS_TO_EXPORT = [
      {
        model: PermitClassification,
        filename: "permit_classifications.ndjson"
      },
      { model: RequirementTemplate, filename: "requirement_templates.ndjson" },
      {
        model: RequirementTemplateSection,
        filename: "requirement_template_sections.ndjson"
      },
      { model: RequirementBlock, filename: "requirement_blocks.ndjson" },
      {
        model: TemplateSectionBlock,
        filename: "template_section_blocks.ndjson"
      },
      { model: Requirement, filename: "requirements.ndjson" },
      { model: TemplateVersion, filename: "template_versions.ndjson" },
      { model: RequirementDocument, filename: "requirement_documents.ndjson" },
      # ActsAsTaggableOn models
      { model: ActsAsTaggableOn::Tag, filename: "tags.ndjson" },
      { model: ActsAsTaggableOn::Tagging, filename: "taggings.ndjson" }
    ]

    def initialize(output_path)
      @output_path = output_path
    end

    def call
      # Ensure directory exists
      dir = File.dirname(@output_path)
      FileUtils.mkdir_p(dir) unless File.directory?(dir)

      # Create/Overwrite the zip file
      Zip::OutputStream.open(@output_path) do |zio|
        # Write Manifest
        write_manifest(zio)

        # Write Models
        MODELS_TO_EXPORT.each do |config|
          write_model(zio, config[:model], config[:filename])
        end
      end

      Rails.logger.info "Export completed to #{@output_path}"
    end

    private

    def write_manifest(zio)
      zio.put_next_entry(MANIFEST_FILENAME)
      manifest = {
        exported_at: Time.current.iso8601,
        environment: Rails.env,
        version: "1.0"
      }
      zio.write(manifest.to_json)
    end

    def write_model(zio, model_class, filename)
      zio.put_next_entry(filename)

      # Use find_each to avoid loading all records into memory.
      # We use .attributes to ensure we get the raw DB columns (snake_case)
      # which is best for a direct DB restore (upsert).
      # Using Blueprinters (frontend views) would introduce transformations
      # that complicate the import process.
      model_class.find_each do |record|
        json_line = record.attributes.to_json
        zio.write(json_line)
        zio.write("\n")
      end
    rescue NameError => e
      Rails.logger.warn "Skipping #{filename}: #{e.message}"
    end
  end
end
