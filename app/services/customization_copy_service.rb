class CustomizationCopyService
  attr_accessor :from_template_version,
                :to_template_version,
                :jurisdiction,
                :sandbox

  def initialize(
    from_template_version,
    to_template_version,
    jurisdiction,
    sandbox
  )
    @from_template_version = from_template_version
    @to_template_version = to_template_version
    @jurisdiction = jurisdiction
    @sandbox = sandbox
  end

  def merge_copy_customizations(include_electives, include_tips)
    from_customization = find_customization(@from_template_version)
    to_customization = find_or_create_customization(@to_template_version)

    merged_customizations =
      merge_customizations(
        from_customization.customizations["requirement_block_changes"],
        to_customization.customizations["requirement_block_changes"] || {},
        include_electives,
        include_tips
      )

    to_customization.update!(
      customizations: {
        "requirement_block_changes" => merged_customizations
      }
    )
    to_customization
  end

  private

  def find_customization(template_version)
    JurisdictionTemplateVersionCustomization.find_by!(
      template_version_id: template_version.id,
      jurisdiction_id: @jurisdiction.id,
      sandbox: @sandbox
    )
  end

  def find_or_create_customization(template_version)
    JurisdictionTemplateVersionCustomization.find_or_create_by!(
      template_version_id: template_version.id,
      jurisdiction_id: @jurisdiction.id,
      sandbox: @sandbox
    ) do |customization|
      customization.customizations = { "requirement_block_changes" => {} }
    end
  end

  def merge_customizations(
    from_blocks,
    to_blocks,
    include_electives,
    include_tips
  )
    merged_blocks = to_blocks.deep_dup

    from_blocks.each do |block_id, changes|
      merged_blocks[block_id] ||= {}

      merged_blocks[block_id]["tip"] = changes["tip"] if include_tips

      if include_electives
        merged_blocks[block_id]["enabled_elective_field_ids"] = changes[
          "enabled_elective_field_ids"
        ] || []
        merged_blocks[block_id]["enabled_elective_field_reasons"] = changes[
          "enabled_elective_field_reasons"
        ] || {}
      end
    end

    merged_blocks
  end
end
