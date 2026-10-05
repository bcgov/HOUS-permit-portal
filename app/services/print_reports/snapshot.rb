module PrintReports
  # Versioned source contract. No attachment IDs or expiring URLs are needed to
  # reconstruct a report. FormIO schema/answer keys must never be camelized here.
  class Snapshot
    FORMAT_VERSION = 1
    UNAVAILABLE =
      "This submission does not contain the saved information required to recreate this report."

    def self.customizations(application)
      application
        .jurisdiction
        .jurisdiction_template_version_customizations
        .find_by(
          template_version: application.template_version,
          sandbox_id: application.sandbox_id
        )
        &.customizations || {}
    end

    def self.capture(
      version,
      customizations: self.customizations(version.permit_application)
    )
      application = version.permit_application
      identity = {
        number: application.number,
        title: "Submitted application",
        address: application.full_address,
        jurisdiction: application.jurisdiction.name,
        applicant: application.submitter&.name,
        tags: application.template_tag_list.to_a,
        template_nickname: application.template_nickname,
        status: "Submitted",
        version_number: application.submission_versions.count + 1,
        submission_version_id: version.id,
        submitted_at: version.created_at.iso8601(6)
      }
      namer =
        PermitApplicationGeneratedFileNamer.new(
          application,
          date: version.created_at
        )
      reports = {
        "application" => {
          kind: "application",
          identity: identity,
          form_json:
            presentation_schema(version.form_json.deep_dup, customizations),
          submission_data: version.submission_data.deep_dup
        }
      }
      filenames = {
        "application" =>
          namer.permit_application_pdf(
            version_number: identity[:version_number]
          )
      }
      if version.has_step_code_checklist?
        checklist = version.step_code_checklist_json.deep_stringify_keys
        kind = checklist["step_code_type"]
        kind ||= "Part9StepCode" if checklist[
          "building_characteristics_summary"
        ].is_a?(Hash)
        unless %w[Part3StepCode Part9StepCode].include?(kind)
          raise Data::Unavailable, "Unknown saved checklist type"
        end
        step = application.step_code
        unless step
          raise Data::Unavailable,
                "Checklist project information is unavailable"
        end
        reports["checklist"] = {
          kind: kind == "Part3StepCode" ? "part3" : "part9",
          identity:
            identity.merge(
              stage: checklist["stage"],
              checklist_id: checklist["id"]
            ),
          checklist: checklist.except("report_document"),
          step_code: {
            title: step.title,
            full_address: step.full_address,
            reference_number: step.reference_number,
            jurisdiction_name: step.jurisdiction_name,
            pid: step.pid,
            permit_date: step.permit_date
          }
        }
        filenames["checklist"] = namer.step_code_checklist_pdf(
          version_number: identity[:version_number]
        )
      end
      snapshot = {
        format_version: FORMAT_VERSION,
        captured_at: Time.current.iso8601(6),
        customizations: customizations.deep_dup,
        document_kinds: reports.keys,
        reports: reports,
        filenames: filenames
      }.as_json
      validate!(snapshot, version)
      snapshot
    end

    def self.validate!(snapshot, version)
      raise Data::Unavailable, UNAVAILABLE unless snapshot.is_a?(Hash)
      unless snapshot["format_version"] == FORMAT_VERSION
        raise Data::Unavailable, "This report snapshot format is not supported."
      end
      reports = snapshot["reports"]
      valid =
        reports.is_a?(Hash) && snapshot["filenames"].is_a?(Hash) &&
          snapshot["captured_at"].present? &&
          snapshot["customizations"].is_a?(Hash) &&
          [%w[application], %w[application checklist]].include?(
            snapshot["document_kinds"]
          ) && reports.keys.sort == snapshot["document_kinds"].sort
      if valid
        app = reports["application"]
        valid =
          app.is_a?(Hash) && app["kind"] == "application" &&
            app.dig("form_json", "components").is_a?(Array) &&
            app["submission_data"].is_a?(Hash)
        keys = snapshot["document_kinds"]
        valid &&=
          keys.all? do |key|
            report = reports[key]
            report.is_a?(Hash) && report["identity"].is_a?(Hash) &&
              (
                %w[
                  number
                  title
                  address
                  jurisdiction
                  applicant
                  tags
                  template_nickname
                  status
                  version_number
                  submission_version_id
                  submitted_at
                ] - report["identity"].keys
              ).empty? &&
              report.dig("identity", "submission_version_id") == version.id &&
              report.dig("identity", "version_number").is_a?(Integer) &&
              report.dig("identity", "submitted_at").present? &&
              snapshot["filenames"][key].is_a?(String) &&
              snapshot["filenames"][key].end_with?(".pdf") &&
              File.basename(snapshot["filenames"][key]) ==
                snapshot["filenames"][key]
          end
        if keys.include?("checklist") && valid
          checklist = reports["checklist"]
          valid &&=
            %w[part3 part9].include?(checklist["kind"]) &&
              checklist["checklist"].is_a?(Hash) &&
              checklist["step_code"].is_a?(Hash)
        end
      end
      unless valid
        raise Data::Unavailable,
              "The saved report snapshot is incomplete or invalid."
      end
      true
    rescue TypeError, NoMethodError
      raise Data::Unavailable,
            "The saved report snapshot is incomplete or invalid."
    end

    def self.report(version, kind)
      validate!(version.report_snapshot, version)
      saved = version.report_snapshot.fetch("reports")[kind]
      raise ActiveRecord::RecordNotFound unless saved
      # Only envelope keys are symbols; saved schema and answer keys are opaque.
      report = saved.deep_dup.symbolize_keys
      report[:identity] = report[:identity].symbolize_keys.merge(
        exported_at: Time.current.iso8601
      )
      report
    end

    def self.filename(version, kind)
      validate!(version.report_snapshot, version)
      version.report_snapshot.fetch("filenames").fetch(kind)
    end

    def self.presentation_schema(schema, customizations)
      unless schema.is_a?(Hash)
        raise Data::Unavailable, "Submission schema is unavailable"
      end
      changes = customizations.fetch("requirement_block_changes", {})
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
