class TemplateVersioningService
  attr_accessor :requirement_template

  # This returns one single TemplateVersion per RequirementTemplate, that
  # can be published at this instance. Note: only the latest version_date is
  # returned because earlier versions will be deprecated, even if they were
  # scheduled for publication, as we only care about the latest changes.
  def self.get_versions_publishable_now
    TemplateVersion
      .select("DISTINCT ON (requirement_templates.id) template_versions.*")
      .joins(:requirement_template)
      .where(
        "template_versions.status = #{TemplateVersion.statuses[:scheduled]} AND template_versions.version_date <= ?",
        Date.current,
      )
      .order("requirement_templates.id, template_versions.version_date DESC")
  end

  def self.publish_versions_publishable_now!
    publishable_versions = get_versions_publishable_now
    errors = []

    publishable_versions.each do |version|
      begin
        publish_version!(version)
      rescue => e
        errors << { version: version, error: e.message }
      end
    end

    raise TemplateVersionsPublishError, errors unless errors.empty?
  end

  def self.schedule!(requirement_template, version_date)
    if !is_valid_schedule_version_date?(requirement_template, version_date)
      raise StandardError.new("Version date must be in the future and after latest scheduled version date")
    end

    template_version =
      requirement_template.template_versions.build(
        denormalized_template_json:
          RequirementTemplateBlueprint.render_as_hash(requirement_template, view: :template_snapshot),
        form_json: requirement_template.to_form_json,
        requirement_blocks_json: form_requirement_blocks_hash(requirement_template),
        version_diff: diff_of_current_changes_and_last_version,
        version_date: version_date,
        status: "scheduled",
      )

    raise StandardError.new(template_version.errors.full_messages.join(", ")) if !template_version.save

    template_version
  end

  def self.publish_version!(template_version)
    return template_version if template_version.status == "published" || template_version.status == "deprecated"

    if template_version.version_date > Date.current
      raise StandardError.new("Version cannot be published before it's scheduled date")
    end

    ActiveRecord::Base.transaction do
      template_version.status = "published"

      deprecate_versions_before_template(template_version)

      raise StandardError.new(template_version.errors.full_messages.join(", ")) if !template_version.save

      previous_version = previous_version(template_version)

      return template_version if previous_version.blank?

      previous_version.jurisdiction_template_version_customizations.each do |customization|
        begin
          copy_jurisdiction_customizations_to_template_version(customization, template_version)
        rescue => e
          # we want to know if an error is happening
          # but don't want to fail the whole publish process because of it
          Rails.logger.error("Error copying customizations to new template version: #{e.message}")
        end
      end
    end

    return template_version
  end

  private

  def self.previous_version(template_version)
    template_version
      .requirement_template
      .template_versions
      .where("version_date <=?", template_version.version_date)
      .where.not(id: template_version.id)
      .order(version_date: :desc)
      .first
  end

  def self.copy_jurisdiction_customizations_to_template_version(
    jurisdiction_template_version_customization,
    new_template_version
  )
    return if jurisdiction_template_version_customization.blank? || new_template_version.blank?

    modified_copied_customizations = jurisdiction_template_version_customization.customizations.deep_dup
    existing_customization_for_template =
      new_template_version.jurisdiction_template_version_customizations.find_by(
        jurisdiction_id: jurisdiction_template_version_customization.jurisdiction_id,
      )
    does_new_template_already_have_customization = existing_customization_for_template.present?

    return if modified_copied_customizations["requirement_block_changes"].blank?

    # Remove any requirement_block_changes if the requirement_block is not present in the new template version
    modified_copied_customizations["requirement_block_changes"].delete_if do |key, _value|
      !new_template_version.requirement_blocks_json.key?(key)
    end

    # Remove any enabled_elective_field_ids that are not present in the new template version's requirement_blocks
    modified_copied_customizations["requirement_block_changes"].each do |key, current_requirement_block_change|
      next if current_requirement_block_change["enabled_elective_field_ids"].blank?

      available_elective_field_ids =
        new_template_version.requirement_blocks_json[key]["requirements"]
          .select { |r| r["elective"] }
          .map { |r| r["id"] }

      modified_copied_customizations["requirement_block_changes"][key]["enabled_elective_field_ids"].delete_if do |id|
        !available_elective_field_ids.include?(id)
      end

      if !does_new_template_already_have_customization ||
           existing_customization_for_template
             .customizations
             .dig("requirement_block_changes", key, "enabled_elective_field_ids")
             .blank?
        next
      end

      # Combine the enabled_elective_field_ids from the old and new template versions and remove any duplicates
      modified_copied_customizations["requirement_block_changes"][key][
        "enabled_elective_field_ids"
      ] = existing_customization_for_template.customizations.dig(
        "requirement_block_changes",
        key,
        "enabled_elective_field_ids",
      ) | modified_copied_customizations.dig("requirement_block_changes", key, "enabled_elective_field_ids")
    end

    copied_jurisdiction_template_version_customization = nil

    if does_new_template_already_have_customization
      copied_jurisdiction_template_version_customization = existing_customization_for_template
      copied_jurisdiction_template_version_customization.customizations = modified_copied_customizations
    else
      copied_jurisdiction_template_version_customization =
        new_template_version.jurisdiction_template_version_customizations.build(
          jurisdiction_id: jurisdiction_template_version_customization.jurisdiction_id,
          customizations: modified_copied_customizations,
        )
    end

    if !copied_jurisdiction_template_version_customization.save
      raise StandardError.new(
              "Old jurisdiction customizations could not be copied to new template version for jurisdiction_id:#{jurisdiction_template_version_customization.jurisdiction_id}",
            )
    end
  end

  def self.deprecate_versions_before_template(template_version)
    template_version
      .requirement_template
      .template_versions
      .where(status: %w[published scheduled])
      .where("version_date <=?", template_version.version_date)
      .where.not(id: template_version.id)
      .update_all(status: "deprecated")
  end

  def self.form_requirement_blocks_hash(requirement_template)
    requirement_blocks_json = {}

    requirement_template.requirement_template_sections.each do |template_section|
      template_section.requirement_blocks.each do |requirement_block|
        requirement_blocks_json[requirement_block.id] = RequirementBlockBlueprint.render_as_hash(requirement_block)
      end
    end

    requirement_blocks_json
  end

  def self.is_valid_schedule_version_date?(requirement_template, version_date)
    last_version = requirement_template.template_versions.order(version_date: :desc).first

    version_date > Date.current && (last_version.blank? || version_date > last_version.version_date)
  end

  def self.diff_of_current_changes_and_last_version
    # TODO
    return {}
  end
end
