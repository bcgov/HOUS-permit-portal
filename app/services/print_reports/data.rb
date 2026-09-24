module PrintReports
  class Data
    class Unavailable < StandardError
    end
    # Only background generation consumes report data; there is no browser API.
    def self.for_generation
      new
    end

    def application(record, version_id = nil)
      version = selected_version(record, version_id)
      schema = version.form_json
      answers = version.submission_data
      unless schema.is_a?(Hash) && schema["components"].is_a?(Array) &&
               answers.is_a?(Hash)
        raise ActiveRecord::RecordNotFound
      end

      {
        kind: "application",
        identity: application_identity(record, version),
        form_json: presentation_schema(record, schema.deep_dup),
        submission_data:
          PermitApplication::SubmissionDataService.new(
            record
          ).formatted_submission_data(
            current_user: nil,
            submission_data: answers
          )
      }
    end

    def application_step_code(record, version_id = nil)
      version = selected_version(record, version_id)
      unless version&.step_code_checklist_json.present?
        raise ActiveRecord::RecordNotFound
      end
      checklist = version.step_code_checklist_json.deep_dup
      # Type comes from the saved snapshot, never the current checklist.
      kind = checklist["step_code_type"] || checklist["stepCodeType"]
      # Part 9's legacy blueprint has no type discriminator. Its saved
      # building-characteristics payload identifies that snapshot contract.
      if kind.blank? &&
           (
             checklist["building_characteristics_summary"].is_a?(Hash) ||
               checklist["buildingCharacteristicsSummary"].is_a?(Hash)
           )
        kind = "Part9StepCode"
      end
      unless %w[Part3StepCode Part9StepCode].include?(kind)
        raise ActiveRecord::RecordNotFound
      end
      {
        kind: kind == "Part3StepCode" ? "part3" : "part9",
        identity:
          application_identity(record, version).merge(
            stage: checklist["stage"],
            checklist_id: checklist["id"]
          ),
        checklist: checklist,
        step_code: snapshot_project_info(checklist)
      }
    end

    def step_code(record, checklist_id = nil)
      if checklist_id.blank?
        raise ArgumentError, "Explicit checklist ID required"
      end
      checklist = record.checklists.find(checklist_id)
      raise ActiveRecord::RecordNotFound unless checklist
      data =
        record
          .checklist_blueprint
          .render_as_hash(checklist, view: :extended)
          .deep_stringify_keys
      project = {
        title: record.title,
        full_address: record.full_address,
        reference_number: record.reference_number,
        jurisdiction_name: record.jurisdiction_name,
        pid: record.pid,
        permit_date: record.permit_date
      }
      {
        kind: record.is_a?(Part3StepCode) ? "part3" : "part9",
        identity: {
          number: record.reference_number,
          title: record.title,
          address: record.full_address,
          status: checklist.status,
          stage: checklist.stage,
          checklist_id: checklist.id,
          updated_at: checklist.updated_at,
          exported_at: Time.current.iso8601
        },
        checklist: data,
        step_code: project
      }
    end

    private

    def selected_version(record, id)
      if id.blank?
        raise ArgumentError, "Explicit submission version ID required"
      end
      record.submission_versions.find(id)
    end

    def application_identity(record, version)
      {
        number: record.number,
        # Cover metadata reflects the application at export time. It is not
        # independently snapshotted with each submission version.
        title: "Submitted application",
        address: record.full_address,
        jurisdiction: record.jurisdiction&.name,
        applicant: record.submitter&.name,
        tags: record.template_tag_list.to_a,
        template_nickname: record.template_nickname,
        status: "Submitted",
        version_number: version&.version_number,
        submission_version_id: version&.id,
        submitted_at: version&.created_at,
        exported_at: Time.current.iso8601
      }
    end

    def snapshot_project_info(checklist)
      checklist.slice(
        "title",
        "full_address",
        "reference_number",
        "jurisdiction_name",
        "pid",
        "permit_date"
      )
    end

    # Match the existing PDF renderer: saved schema/answers use the application's
    # customization snapshot. Older submissions have no per-version settings.
    # Apply visibility only, to a clone; never import editing decorations.
    def presentation_schema(record, schema)
      changes =
        record.form_customizations&.fetch("requirement_block_changes", {}) || {}
      visit =
        lambda do |component, block_id = nil|
          block_id = component["id"] if changes.key?(component["id"])
          conditional = component["customConditional"].to_s
          if component["elective"] && conditional.end_with?(";show = false")
            enabled = changes.dig(block_id, "enabled_elective_field_ids") || []
            component["customConditional"] = conditional.delete_suffix(
              ";show = false"
            ) if enabled.include?(component["id"])
          end
          Array(component["components"]).each do |child|
            visit.call(child, block_id)
          end
          Array(component["columns"]).each do |column|
            visit.call(column, block_id)
          end
          Array(component["rows"]).flatten.each do |cell|
            visit.call(cell, block_id)
          end
        end
      visit.call(schema)
      schema
    end
  end
end
