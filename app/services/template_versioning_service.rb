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
        Date.current
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
      raise TemplateVersionScheduleError.new(
              "Version date must be in the future and after latest scheduled version date"
            )
    end

    template_version =
      requirement_template.template_versions.build(
        denormalized_template_json:
          RequirementTemplateBlueprint.render_as_hash(
            requirement_template,
            view: :template_snapshot
          ),
        form_json: requirement_template.to_form_json,
        requirement_blocks_json:
          form_requirement_blocks_hash(requirement_template),
        version_diff: diff_of_current_changes_and_last_version,
        version_date: version_date,
        status: "scheduled"
      )

    if !template_version.save
      raise TemplateVersionScheduleError.new(
              template_version.errors.full_messages.join(", ")
            )
    end

    template_version
  end

  def self.unschedule!(template_version, deprecated_by)
    return template_version unless template_version.status == "scheduled"

    template_version.status = "deprecated"
    template_version.deprecation_reason =
      TemplateVersion.deprecation_reasons[:unscheduled]
    template_version.deprecated_by = deprecated_by

    unless template_version.save
      raise TemplateVersionUnscheduleError.new(
              template_version.errors.full_messages.join(", ")
            )
    end

    template_version
  end

  def self.force_publish_now!(requirement_template, for_early_access = false)
    unless ENV["ENABLE_TEMPLATE_FORCE_PUBLISH"] == "true" || for_early_access
      raise TemplateVersionForcePublishNowError.new(
              "Force publish is not enabled"
            )
    end

    version_date = Date.current

    template_version =
      requirement_template.template_versions.build(
        denormalized_template_json:
          RequirementTemplateBlueprint.render_as_hash(
            requirement_template,
            view: :template_snapshot
          ),
        form_json: requirement_template.to_form_json,
        requirement_blocks_json:
          form_requirement_blocks_hash(requirement_template),
        version_diff: diff_of_current_changes_and_last_version,
        version_date: version_date,
        status: "scheduled"
      )

    if !template_version.save
      raise TemplateVersionScheduleError.new(
              template_version.errors.full_messages.join(", ")
            )
    end

    template_version.reload

    ModelCallbackJob.perform_async(
      template_version.class.name,
      template_version.id,
      "force_publish_now!"
    )

    template_version
  end

  def self.publish_early_access_version!(requirement_template)
    unless requirement_template.type == EarlyAccessRequirementTemplate.name
      raise TemplateVersionPublishError.new(
              "Cannot create early access version for a non-early access requirement template"
            )
    end

    self.force_publish_now!(requirement_template, true)
  end

  def self.publish_version!(template_version, skip_date_check = false)
    if template_version.status == "published" ||
         template_version.status == "deprecated"
      return template_version
    end

    skip_date_check =
      skip_date_check && (ENV["ENABLE_TEMPLATE_FORCE_PUBLISH"] == "true")

    if template_version.version_date > Date.current && (!skip_date_check)
      raise TemplateVersionPublishError.new(
              "Version cannot be published before it's scheduled date"
            )
    end

    ActiveRecord::Base.transaction do
      template_version.status = "published"

      deprecate_versions_before_template(template_version)

      if !template_version.save
        raise TemplateVersionPublishError.new(
                template_version.errors.full_messages.join(", ")
              )
      end

      previous_version = template_version.previous_version

      return template_version if previous_version.blank?

      previous_version
        .jurisdiction_template_version_customizations
        .each do |customization|
        begin
          copy_jurisdiction_customizations_to_template_version(
            customization,
            template_version
          )
        rescue => e
          # we want to know if an error is happening
          # but don't want to fail the whole publish process because of it
          Rails.logger.error(
            "Error copying customizations to new template version: #{e.message}"
          )
        end
      end

      # Publish the notification
      NotificationService.publish_new_template_version_publish_event(
        template_version
      )
    end

    return template_version
  end

  def self.update_draft_permit_with_new_template_version(permit_application)
    return if permit_application.submitted?

    new_template_version =
      permit_application.template_version.published_template_version

    # TODO: Does submission_data need to be changed?

    permit_application.update(template_version: new_template_version)
  end

  def self.add_current_section_labels(form_json, requirement_blueprints)
    find_section_label =
      lambda do |id|
        form_json["components"].each do |section|
          section_label = section["label"]
          section["components"].each do |block|
            block["components"].each do |component|
              return section_label if component["id"] == id
            end
          end
        end
        nil
      end

    requirement_blueprints.each do |blueprint|
      section_label = find_section_label.call(blueprint["id"])
      blueprint["diff_section_label"] = section_label
    end

    requirement_blueprints
  end

  def self.produce_diff_hash(before_version, template_version)
    before_version ||= template_version.previous_version

    before_json = before_version&.requirement_blocks_json
    after_json = template_version.requirement_blocks_json

    before_requirements =
      before_json&.values&.flat_map { |block| block["requirements"] }

    after_requirements =
      after_json&.values&.flat_map { |block| block["requirements"] }

    before_requirements_components =
      before_json&.values&.flat_map do |block|
        block["form_json"]["components"]
      end || []

    after_requirements_components =
      after_json&.values&.flat_map do |block|
        block["form_json"]["components"]
      end || []

    before_ids = before_requirements&.map { |req| req["id"] } || []
    after_ids = after_requirements&.map { |req| req["id"] } || []

    added_ids = after_ids - before_ids
    removed_ids = before_ids - after_ids
    intersection_ids = before_ids & after_ids
    changed_ids =
      intersection_ids.select do |id|
        before_req =
          before_requirements
            .find { |req| req["id"] == id }
            .reject { |key, _| key == "updated_at" }
        after_req =
          after_requirements
            .find { |req| req["id"] == id }
            .reject { |key, _| key == "updated_at" }
        before_req != after_req
      end

    added_requirement_blueprints =
      after_requirements&.select { |req| added_ids.include?(req["id"]) } || []
    removed_requirement_blueprints =
      before_requirements&.select { |req| removed_ids.include?(req["id"]) } ||
        []
    changed_requirement_blueprints =
      after_requirements&.select { |req| changed_ids.include?(req["id"]) } || []

    # Workaround: need to add the fully formed form_json into the requirement blueprint
    (
      changed_requirement_blueprints + added_requirement_blueprints +
        removed_requirement_blueprints
    ).each do |blueprint|
      matching_component =
        (
          after_requirements_components + before_requirements_components
        ).find { |component| component["id"] == blueprint["id"] }

      blueprint["form_json"] = matching_component if matching_component
    end

    {
      added:
        add_current_section_labels(
          template_version.form_json,
          added_requirement_blueprints
        ),
      changed:
        add_current_section_labels(
          template_version.form_json,
          changed_requirement_blueprints
        ),
      removed:
        add_current_section_labels(
          before_version.form_json,
          removed_requirement_blueprints
        )
    }
  end

  def self.previous_published_version(template_version)
    template_version
      .requirement_template
      .template_versions
      .where(
        "version_date <=? AND status = ? AND deprecation_reason = ?",
        template_version.version_date,
        TemplateVersion.statuses[:deprecated],
        TemplateVersion.deprecation_reasons[:new_publish]
      )
      .where.not(id: template_version.id)
      .order(version_date: :desc, created_at: :desc)
      .first
  end

  def self.latest_published_version(template_version)
    template_version
      .requirement_template
      .template_versions
      .where(status: TemplateVersion.statuses[:published])
      .order(version_date: :desc, created_at: :desc)
      .last
  end

  private

  def self.copy_jurisdiction_customizations_to_template_version(
    jurisdiction_template_version_customization,
    new_template_version
  )
    if jurisdiction_template_version_customization.blank? ||
         new_template_version.blank?
      return
    end

    modified_copied_customizations =
      jurisdiction_template_version_customization.customizations.deep_dup
    existing_customization_for_template =
      new_template_version.jurisdiction_template_version_customizations.find_by(
        jurisdiction_id:
          jurisdiction_template_version_customization.jurisdiction_id
      )
    does_new_template_already_have_customization =
      existing_customization_for_template.present?

    return if modified_copied_customizations["requirement_block_changes"].blank?

    # Remove any requirement_block_changes if the requirement_block is not present in the new template version
    modified_copied_customizations[
      "requirement_block_changes"
    ].delete_if do |key, _value|
      !new_template_version.requirement_blocks_json.key?(key)
    end

    # Remove any enabled_elective_field_ids and reasons that are not present in the new template version's
    # requirement_blocks
    modified_copied_customizations[
      "requirement_block_changes"
    ].each do |key, current_requirement_block_change|
      if current_requirement_block_change["enabled_elective_field_ids"].blank?
        next
      end

      available_elective_field_ids =
        new_template_version.requirement_blocks_json[key]["requirements"]
          .select { |r| r["elective"] }
          .map { |r| r["id"] }

      modified_copied_customizations["requirement_block_changes"][key][
        "enabled_elective_field_ids"
      ].delete_if { |id| !available_elective_field_ids.include?(id) }

      if modified_copied_customizations.dig(
           "requirement_block_changes",
           key,
           "enabled_elective_field_reasons"
         ).present?
        modified_copied_customizations
          .dig(
            "requirement_block_changes",
            key,
            "enabled_elective_field_reasons"
          )
          .delete_if { |id| !available_elective_field_ids.include?(id) }
      else
        modified_copied_customizations["requirement_block_changes"][key][
          "enabled_elective_field_reasons"
        ] = {}
      end

      if !does_new_template_already_have_customization ||
           existing_customization_for_template
             .customizations
             .dig(
               "requirement_block_changes",
               key,
               "enabled_elective_field_ids"
             )
             .blank?
        next
      end

      # Combine the enabled_elective_field_ids from the old and new template versions and remove any duplicates
      modified_copied_customizations["requirement_block_changes"][key][
        "enabled_elective_field_ids"
      ] = existing_customization_for_template.customizations.dig(
        "requirement_block_changes",
        key,
        "enabled_elective_field_ids"
      ) |
        modified_copied_customizations.dig(
          "requirement_block_changes",
          key,
          "enabled_elective_field_ids"
        )

      # Combine the enabled_elective_field_reasons from the old and new template versions and remove any duplicates
      modified_copied_customizations.dig(
        "requirement_block_changes",
        key,
        "enabled_elective_field_reasons"
      ).merge!(
        existing_customization_for_template.customizations.dig(
          "requirement_block_changes",
          key,
          "enabled_elective_field_reasons"
        )
      )
    end

    copied_jurisdiction_template_version_customization = nil

    if does_new_template_already_have_customization
      copied_jurisdiction_template_version_customization =
        existing_customization_for_template
      copied_jurisdiction_template_version_customization.customizations =
        modified_copied_customizations
    else
      copied_jurisdiction_template_version_customization =
        new_template_version.jurisdiction_template_version_customizations.build(
          jurisdiction_id:
            jurisdiction_template_version_customization.jurisdiction_id,
          customizations: modified_copied_customizations
        )
    end

    if !copied_jurisdiction_template_version_customization.save
      raise TemplateVersionPublishError.new(
              "Old jurisdiction customizations could not be copied to new template version for jurisdiction_id:#{jurisdiction_template_version_customization.jurisdiction_id}"
            )
    end
  end

  def self.deprecate_versions_before_template(template_version)
    template_versions =
      template_version
        .requirement_template
        .template_versions
        .where(status: %w[published scheduled])
        .where("version_date <=?", template_version.version_date)
        .where.not(id: template_version.id)

    if (template_version.early_access?)
      template_versions.destroy_all
    else
      template_versions.update_all(
        status: "deprecated",
        deprecation_reason: TemplateVersion.deprecation_reasons[:new_publish]
      )
    end
  end

  def self.form_requirement_blocks_hash(requirement_template)
    requirement_blocks_json = {}

    requirement_template
      .requirement_template_sections
      .each do |template_section|
      template_section.requirement_blocks.each do |requirement_block|
        requirement_blocks_json[
          requirement_block.id
        ] = RequirementBlockBlueprint.render_as_hash(
          requirement_block,
          parent_key: template_section.key
        )
      end
    end

    requirement_blocks_json
  end

  def self.is_valid_schedule_version_date?(requirement_template, version_date)
    last_scheduled_version =
      requirement_template
        .template_versions
        .where(status: TemplateVersion.statuses[:scheduled])
        .order(version_date: :desc, created_at: :desc)
        .first

    version_date > Date.current &&
      (
        last_scheduled_version.blank? ||
          version_date > last_scheduled_version.version_date
      )
  end

  def self.diff_of_current_changes_and_last_version
    # TODO
    return {}
  end
end
