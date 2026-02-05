module PermitApplicationStatus
  extend ActiveSupport::Concern
  included do
    include AASM
    enum :status,
         {
           new_draft: 0,
           newly_submitted: 1,
           revisions_requested: 3,
           resubmitted: 4
           #  approved: 5
         },
         default: 0

    def self.draft_statuses
      %w[new_draft revisions_requested]
    end

    def self.submitted_statuses
      %w[newly_submitted resubmitted]
    end

    aasm column: "status", enum: true, timestamp: true do
      state :new_draft, initial: true
      state :newly_submitted
      state :revisions_requested
      state :resubmitted

      event :submit do
        transitions from: :new_draft,
                    to: :newly_submitted,
                    guard: :can_submit?,
                    after: :handle_submission
        transitions from: :revisions_requested,
                    to: :resubmitted,
                    guard: :can_submit?,
                    after: :handle_submission
      end

      event :finalize_revision_requests do
        transitions from: %i[newly_submitted resubmitted],
                    to: :revisions_requested,
                    guard: :can_finalize_requests?,
                    after: :handle_finalize_revision_requests
      end
    end

    def draft?
      new_draft? || revisions_requested?
    end

    def submitted?
      newly_submitted? || resubmitted?
    end

    def pertinence_score
      {
        "new_draft" => 30,
        "newly_submitted" => 10,
        "resubmitted" => 20,
        "revisions_requested" => 40
      }[
        status
      ] || -1
    end

    def can_submit?
      return false unless inbox_enabled? || sandbox.present?
      return false if template_version_disabled_by_jurisdiction?

      signed =
        submission_data.dig("data", "section-completion-key", "signed").present?
      signed && using_current_template_version
    end

    def template_version_disabled_by_jurisdiction?
      return false if sandbox.present? # Sandbox applications not affected

      jurisdiction&.jurisdiction_template_version_customizations&.live&.exists?(
        template_version: template_version,
        disabled: true
      ) || false
    end

    def can_finalize_requests?
      latest_submission_version.revision_requests.any?
    end

    def handle_finalize_revision_requests
      update(revisions_requested_at: Time.current)
      NotificationService.publish_application_revisions_request_event(self)
    end

    def handle_submission
      update(signed_off_at: Time.current)

      checklist = step_code&.primary_checklist
      submission_versions.create!(
        form_json: self.form_json,
        submission_data: self.submission_data,
        step_code_checklist_json:
          (
            if checklist.present?
              step_code.checklist_blueprint.render_as_hash(
                checklist,
                view: :extended
              )
            else
              nil
            end
          )
      )

      zip_and_upload_supporting_documents

      send_submit_notifications
    end
  end
end
