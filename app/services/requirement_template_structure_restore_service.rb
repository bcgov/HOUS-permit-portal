# Rebuilds a RequirementTemplate's sections and TemplateSectionBlock join rows
# from a TemplateVersion's denormalized_template_json snapshot.
# Re-links existing RequirementBlocks by ID; does not mutate block content.
class RequirementTemplateStructureRestoreService
  def initialize(template_version)
    @template_version = template_version
    @requirement_template = template_version.requirement_template
  end

  def call!
    if @requirement_template.blank? || @requirement_template.discarded?
      raise RequirementTemplateStructureRestoreError,
            I18n.t(
              "services.requirement_template_structure_restore_service.template_unavailable"
            )
    end

    snapshot = @template_version.denormalized_template_json
    if snapshot.blank?
      raise RequirementTemplateStructureRestoreError,
            I18n.t(
              "services.requirement_template_structure_restore_service.empty_snapshot"
            )
    end

    section_payloads = extract_sections(snapshot)
    block_refs = collect_block_refs(section_payloads)
    validate_blocks!(block_refs)

    ActiveRecord::Base.transaction do
      @requirement_template.requirement_template_sections.destroy_all

      section_payloads.each_with_index do |section_payload, section_index|
        section =
          @requirement_template.requirement_template_sections.create!(
            name: dig_key(section_payload, "name"),
            position: section_index
          )

        extract_template_section_blocks(
          section_payload
        ).each_with_index do |tsb_payload, block_index|
          section.template_section_blocks.create!(
            requirement_block_id: block_id_from(tsb_payload),
            position: block_index,
            conditional: dig_key(tsb_payload, "conditional")
          )
        end
      end

      @requirement_template.touch
      @requirement_template.reload
    end
  end

  private

  def extract_sections(snapshot)
    sections = dig_key(snapshot, "requirement_template_sections")
    unless sections.is_a?(Array)
      raise RequirementTemplateStructureRestoreError,
            I18n.t(
              "services.requirement_template_structure_restore_service.malformed_snapshot"
            )
    end
    sections
  end

  def extract_template_section_blocks(section_payload)
    blocks = dig_key(section_payload, "template_section_blocks")
    blocks.is_a?(Array) ? blocks : []
  end

  def collect_block_refs(section_payloads)
    refs = []
    section_payloads.each do |section_payload|
      extract_template_section_blocks(section_payload).each do |tsb_payload|
        id = block_id_from(tsb_payload)
        name =
          dig_key(tsb_payload, "requirement_block")&.then do |b|
            dig_key(b, "name") || dig_key(b, "display_name")
          end
        refs << { id: id, name: name }
      end
    end
    refs
  end

  def block_id_from(tsb_payload)
    dig_key(tsb_payload, "requirement_block_id") ||
      dig_key(dig_key(tsb_payload, "requirement_block") || {}, "id")
  end

  def validate_blocks!(block_refs)
    missing = []

    block_refs.each do |ref|
      id = ref[:id]
      if id.blank?
        missing << (ref[:name].presence || "(missing id)")
        next
      end

      block = RequirementBlock.find_by(id: id)
      if block.nil? || block.discarded?
        label = ref[:name].presence || block&.name || id
        missing << label
      end
    end

    return if missing.empty?

    raise RequirementTemplateStructureRestoreError,
          I18n.t(
            "services.requirement_template_structure_restore_service.missing_blocks",
            blocks: missing.uniq.join(", ")
          )
  end

  # Snapshot JSON may use snake_case (Blueprinter render_as_hash) or camelCase.
  def dig_key(hash, snake_key)
    return nil unless hash.is_a?(Hash)

    key = snake_key.to_s
    camel_key = key.camelize(:lower)
    hash[key] || hash[key.to_sym] || hash[camel_key] || hash[camel_key.to_sym]
  end
end
