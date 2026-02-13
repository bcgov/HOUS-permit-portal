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
              I18n.t(
                "services.template_versioning_service.invalid_schedule_date"
              )
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

  def self.force_publish_now!(requirement_template)
    unless ENV["ENABLE_TEMPLATE_FORCE_PUBLISH"] == "true"
      raise TemplateVersionForcePublishNowError.new(
              I18n.t(
                "services.template_versioning_service.force_publish_disabled"
              )
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

  def self.create_or_update_published_version_for_early_access!(
    requirement_template
  )
    unless requirement_template.type == EarlyAccessRequirementTemplate.name
      raise TemplateVersionPublishError,
            I18n.t(
              "services.template_versioning_service.early_access_version_error"
            )
    end

    attributes = {
      denormalized_template_json:
        RequirementTemplateBlueprint.render_as_hash(
          requirement_template,
          view: :template_snapshot
        ),
      form_json: requirement_template.to_form_json,
      requirement_blocks_json:
        form_requirement_blocks_hash(requirement_template),
      version_date: Date.current,
      status: "published"
    }
    if requirement_template.id.present?
      requirement_template.reload_published_template_version
    end
    version =
      requirement_template.published_template_version ||
        requirement_template.template_versions.build
    version.assign_attributes(attributes)
    version.save!
  end

  # ── Draft workflow methods ──────────────────────────────────────────────

  # Creates a new draft TemplateVersion for a LiveRequirementTemplate.
  # Snapshots the current template state (sections, blocks, form JSON)
  # into the draft's JSON columns so edits are isolated from canonical records.
  def self.create_draft!(requirement_template, assignee: nil)
    if requirement_template.draft_template_version.present?
      raise TemplateVersionDraftError,
            "A draft version already exists for this template. Discard or promote it first."
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
        version_date: Date.current,
        status: "draft",
        assignee: assignee
      )

    unless template_version.save
      raise TemplateVersionDraftError,
            template_version.errors.full_messages.join(", ")
    end

    template_version
  end

  # Updates a specific block within the draft's requirement_blocks_json.
  # This is copy-on-write: the canonical RequirementBlock record is NOT modified.
  # block_data should be a hash matching the RequirementBlockBlueprint format.
  def self.update_draft_block!(draft_version, block_id, block_data)
    unless draft_version.draft?
      raise TemplateVersionDraftError,
            "Can only update blocks on a draft version"
    end

    blocks_json = draft_version.requirement_blocks_json.deep_dup
    unless blocks_json.key?(block_id)
      raise TemplateVersionDraftError,
            "Block #{block_id} not found in this draft version"
    end

    blocks_json[block_id] = blocks_json[block_id].merge(block_data)
    draft_version.update!(requirement_blocks_json: blocks_json)

    # Also regenerate the form_json to reflect the block changes
    regenerate_draft_form_json!(draft_version)

    draft_version
  end

  # Refreshes the draft's denormalized snapshots from the current live template state.
  # Useful when the template's sections have been reorganized but you want to
  # keep any draft-specific block edits.
  def self.refresh_draft_snapshot!(draft_version)
    unless draft_version.draft?
      raise TemplateVersionDraftError, "Can only refresh a draft version"
    end

    requirement_template = draft_version.requirement_template
    fresh_blocks_json = form_requirement_blocks_hash(requirement_template)

    # Preserve any draft-specific block edits (copy-on-write overrides)
    merged_blocks_json =
      fresh_blocks_json.merge(
        draft_version.requirement_blocks_json.slice(*fresh_blocks_json.keys)
      )

    draft_version.update!(
      denormalized_template_json:
        RequirementTemplateBlueprint.render_as_hash(
          requirement_template,
          view: :template_snapshot
        ),
      requirement_blocks_json: merged_blocks_json,
      form_json: requirement_template.to_form_json
    )

    draft_version
  end

  # Promotes a draft to scheduled status with a future version_date.
  # The draft's JSON snapshot becomes the scheduled version's snapshot.
  def self.promote_draft_to_scheduled!(
    draft_version,
    version_date,
    change_notes: nil,
    change_significance: nil
  )
    unless draft_version.draft?
      raise TemplateVersionDraftError, "Can only promote a draft version"
    end

    requirement_template = draft_version.requirement_template
    unless is_valid_schedule_version_date?(requirement_template, version_date)
      raise TemplateVersionScheduleError.new(
              I18n.t(
                "services.template_versioning_service.invalid_schedule_date"
              )
            )
    end

    # Compute the diff against the currently published version
    version_diff = compute_version_diff(draft_version)

    draft_version.assign_attributes(
      status: "scheduled",
      version_date: version_date,
      version_diff: version_diff,
      change_notes: change_notes,
      change_significance: change_significance
    )

    unless draft_version.save
      raise TemplateVersionScheduleError.new(
              draft_version.errors.full_messages.join(", ")
            )
    end

    draft_version
  end

  # When a draft is published, optionally write block changes back to the
  # canonical RequirementBlock records so other templates pick them up.
  # block_ids_to_promote is an array of block IDs whose draft edits should
  # be written back. If nil/empty, no canonical records are modified.
  def self.promote_block_changes!(draft_version, block_ids_to_promote = [])
    return if block_ids_to_promote.blank?
    unless draft_version.draft? || draft_version.scheduled? ||
             draft_version.published?
      raise TemplateVersionDraftError,
            "Can only promote block changes from a draft, scheduled, or published version"
    end

    blocks_json = draft_version.requirement_blocks_json

    block_ids_to_promote.each do |block_id|
      draft_block_data = blocks_json[block_id]
      next if draft_block_data.blank?

      canonical_block = RequirementBlock.find_by(id: block_id)
      next if canonical_block.blank?

      # Update requirements on the canonical block from the draft's snapshot
      draft_requirements = draft_block_data["requirements"]
      next if draft_requirements.blank?

      draft_requirements.each do |draft_req|
        requirement = canonical_block.requirements.find_by(id: draft_req["id"])
        next if requirement.blank?

        # Update mutable fields from the draft snapshot
        requirement.update(
          label: draft_req["label"],
          input_type: draft_req["input_type"],
          hint: draft_req["hint"],
          required: draft_req["required"],
          elective: draft_req["elective"]
        )
      end
    end
  end

  # Discards a draft version (sets to deprecated).
  def self.discard_draft!(draft_version)
    unless draft_version.draft?
      raise TemplateVersionDraftError, "Can only discard a draft version"
    end

    draft_version.update!(
      status: "deprecated",
      deprecation_reason: "unscheduled"
    )

    draft_version
  end

  # ── End draft workflow methods ──────────────────────────────────────────

  def self.publish_version!(template_version, skip_date_check = false)
    if template_version.status == "published" ||
         template_version.status == "deprecated"
      return template_version
    end

    skip_date_check &&= (ENV["ENABLE_TEMPLATE_FORCE_PUBLISH"] == "true")

    if template_version.version_date > Date.current && !skip_date_check
      raise TemplateVersionPublishError,
            I18n.t(
              "services.template_versioning_service.publish_before_schedule_date"
            )
    end

    ActiveRecord::Base.transaction do
      # Populate version_diff before publishing (replaces the old TODO)
      if template_version.version_diff.blank? ||
           template_version.version_diff == {}
        template_version.version_diff = compute_version_diff(template_version)
      end

      template_version.status = "published"

      deprecate_versions_before_template(template_version)

      unless template_version.save
        raise TemplateVersionPublishError,
              template_version.errors.full_messages.join(", ")
      end

      previous_version = template_version.previous_version

      # Copy customizations only if there's a previous version
      if previous_version.present?
        previous_version
          .jurisdiction_template_version_customizations
          .each do |customization|
          begin
            copy_jurisdiction_customizations_to_template_version(
              customization,
              template_version
            )
          rescue StandardError => e
            # we want to know if an error is happening
            # but don't want to fail the whole publish process because of it
            Rails.logger.error(
              I18n.t(
                "services.template_versioning_service.copy_customizations_log_error",
                message: e.message
              )
            )
          end
        end
      end
    end
    # Publish the notification after the transaction successfully completes,
    # respecting the notification_scope set on the template version.
    unless template_version.notification_scope_silent?
      NotificationService.publish_new_template_version_publish_event(
        template_version
      )
    end

    template_version
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
              I18n.t(
                "services.template_versioning_service.copy_customizations_error",
                jurisdiction_id:
                  jurisdiction_template_version_customization.jurisdiction_id
              )
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

    template_versions.update_all(
      status: "deprecated",
      deprecation_reason: TemplateVersion.deprecation_reasons[:new_publish]
    )
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

  # Computes a structured diff between a template_version and the previously
  # published version of its requirement_template. Used to populate version_diff.
  def self.compute_version_diff(template_version)
    previous = previous_published_version(template_version)
    return {} if previous.blank?

    produce_diff_hash(previous, template_version)
  rescue StandardError => e
    Rails.logger.error("Failed to compute version diff: #{e.message}")
    {}
  end

  # Regenerates the form_json on a draft version from its requirement_blocks_json.
  # Called after draft block edits so the form preview stays in sync.
  def self.regenerate_draft_form_json!(draft_version)
    requirement_template = draft_version.requirement_template
    # Re-generate form_json from the live template structure.
    # Block-level form_json within requirement_blocks_json is already updated
    # by update_draft_block!, so the form rendering will pick up those changes.
    draft_version.update!(
      form_json: requirement_template.to_form_json,
      denormalized_template_json:
        RequirementTemplateBlueprint.render_as_hash(
          requirement_template,
          view: :template_snapshot
        )
    )
  end
end
