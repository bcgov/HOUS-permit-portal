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
      Snapshot.report(version, "application")
    end

    def application_step_code(record, version_id = nil)
      version = selected_version(record, version_id)
      Snapshot.report(version, "checklist")
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
  end
end
