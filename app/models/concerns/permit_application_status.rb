module PermitApplicationStatus
  extend ActiveSupport::Concern

  MANUAL_TRANSITIONS = {
    new_draft: [],
    newly_submitted: %i[in_review],
    in_review: %i[approved withdrawn],
    revisions_requested: [],
    resubmitted: %i[in_review],
    approved: %i[issued withdrawn],
    issued: %i[in_review],
    withdrawn: %i[in_review]
  }.freeze

  STATUS_EVENT_MAP = {
    "in_review" => :start_review,
    "approved" => :approve,
    "issued" => :issue_permit,
    "withdrawn" => :withdraw
  }.freeze

  included do
    include AASM

    before_save :update_queue_clock, if: :status_changed?

    enum :status,
         {
           new_draft: 0,
           newly_submitted: 1,
           in_review: 2,
           revisions_requested: 3,
           resubmitted: 4,
           approved: 5,
           issued: 6,
           withdrawn: 7
         },
         default: 0

    def self.draft_statuses
      %w[new_draft revisions_requested].freeze
    end

    def self.submitted_statuses
      %w[newly_submitted resubmitted in_review approved issued withdrawn].freeze
    end

    def self.our_court_statuses
      %w[newly_submitted resubmitted in_review]
    end

    aasm column: "status", enum: true, timestamp: true do
      state :new_draft, initial: true
      state :newly_submitted
      state :in_review
      state :revisions_requested
      state :resubmitted
      state :approved
      state :issued
      state :withdrawn

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

      event :start_review do
        transitions from: :newly_submitted,
                    to: :in_review,
                    after: :handle_review_started
        transitions from: :resubmitted,
                    to: :in_review,
                    after: :handle_review_started
        transitions from: :withdrawn, to: :in_review
        transitions from: :issued, to: :in_review
      end

      event :finalize_revision_requests do
        transitions from: %i[newly_submitted resubmitted in_review],
                    to: :revisions_requested,
                    guard: :can_finalize_requests?,
                    after: :handle_finalize_revision_requests
      end

      event :approve do
        transitions from: :in_review, to: :approved
      end

      event :issue_permit do
        transitions from: :approved, to: :issued
      end

      event :withdraw do
        transitions from: %i[
                      new_draft
                      newly_submitted
                      in_review
                      revisions_requested
                      resubmitted
                      approved
                    ],
                    to: :withdrawn
      end
    end

    def draft?
      self.class.draft_statuses.include?(status)
    end

    def intake?
      newly_submitted? || resubmitted?
    end

    def submitted?
      self.class.submitted_statuses.include?(status)
    end

    def visible_to_reviewers?
      submitted? || revisions_requested?
    end

    def decided?
      approved? || issued? || withdrawn?
    end

    def terminal?
      issued? || withdrawn?
    end

    def self.kanban_statuses
      %w[
        newly_submitted
        in_review
        revisions_requested
        resubmitted
        approved
        issued
        withdrawn
      ]
    end

    def self.off_board_statuses
      %w[new_draft]
    end

    def allowed_manual_transitions
      MANUAL_TRANSITIONS[status.to_sym] || []
    end

    def pertinence_score
      {
        "new_draft" => 30,
        "newly_submitted" => 10,
        "in_review" => 15,
        "resubmitted" => 20,
        "revisions_requested" => 40,
        "approved" => 5,
        "issued" => 1,
        "withdrawn" => -1
      }[
        status
      ] || -1
    end

    def inbox_pertinence_score
      {
        "newly_submitted" => 40,
        "resubmitted" => 35,
        "in_review" => 25,
        "revisions_requested" => 15,
        "new_draft" => 5,
        "approved" => 3,
        "issued" => 1,
        "withdrawn" => -1
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

    def handle_review_started
      NotificationService.publish_review_started_event(self)
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

    def update_queue_clock
      was_our_court = self.class.our_court_statuses.include?(status_was)
      is_our_court = self.class.our_court_statuses.include?(status)

      if was_our_court && queue_clock_started_at.present?
        self.queue_time_seconds += (Time.current - queue_clock_started_at).to_i
        self.queue_clock_started_at = nil
      end

      self.queue_clock_started_at = Time.current if is_our_court
    end
  end
end
