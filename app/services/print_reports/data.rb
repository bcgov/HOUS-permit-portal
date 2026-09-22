module PrintReports
  class Data
    class Unavailable < StandardError
    end
    def initialize(user)
      @user = user
    end

    def application(record, version_id = nil)
      version = selected_version(record, version_id)
      schema =
        (
          if version
            version.form_json
          else
            record.form_json(current_user: report_field_user(record))
          end
        )
      answers = version ? version.submission_data : record.submission_data
      unless schema.is_a?(Hash) && schema["components"].is_a?(Array) &&
               answers.is_a?(Hash)
        raise ActiveRecord::RecordNotFound
      end

      {
        kind: "application",
        identity: application_identity(record, version),
        form_json:
          presentation_schema(
            record,
            permitted_schema(record, schema.deep_dup)
          ),
        submission_data:
          PermitApplication::SubmissionDataService.new(
            record
          ).formatted_submission_data(
            current_user: report_field_user(record),
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
      checklist =
        (
          if checklist_id.present?
            record.checklists.find(checklist_id)
          else
            record.current_checklist
          end
        )
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
      return record.submission_versions.find(id) if id.present?
      record.submission_versions.order(created_at: :desc, id: :desc).first
    end

    def application_identity(record, version)
      {
        number: record.number,
        # Address/title are current application metadata; historical answers below
        # always come from the selected snapshot and are never substituted.
        title: version ? "Submitted application" : record.nickname,
        address: version ? nil : record.full_address,
        status: version ? "Submitted" : "Draft",
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

    # Match PermitApplicationBlueprint's jurisdiction_review_extended view:
    # reviewers can read the complete form after controller authorization.
    def report_field_user(record)
      if @user.review_staff? && @user.member_of?(record.jurisdiction_id)
        return nil
      end
      @user
    end

    def permitted_schema(record, schema)
      return schema if report_field_user(record).nil?
      permissions =
        record.submission_requirement_block_edit_permissions(user_id: @user.id)
      return schema if permissions == :all
      permissions = Array(permissions)
      filter =
        lambda do |components|
          Array(components).filter_map do |component|
            block_id = component["key"].to_s[/\|RB([^|]+)/, 1]
            next if block_id && !permissions.include?(block_id)
            component["components"] = filter.call(
              component["components"]
            ) if component["components"]
            Array(component["columns"]).each do |column|
              column["components"] = filter.call(column["components"])
            end
            Array(component["rows"]).flatten.each do |cell|
              cell["components"] = filter.call(
                cell["components"]
              ) if cell.is_a?(Hash)
            end
            component
          end
        end
      schema["components"] = filter.call(schema["components"])
      schema
    end
  end
end
