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

    scope :submitted_at_least_once, -> { where.not(status: :new_draft) }

    aasm column: "status", enum: true, timestamp: true do
      before_all_events :reject_if_discarded

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
        transitions from: :approved, to: :issued, after: :stamp_issued_at
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

    def submitted_at_least_once?
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
      return [] if discarded? || permit_project&.discarded?

      MANUAL_TRANSITIONS[status.to_sym] || []
    end

    def reject_if_discarded
      return unless discarded? || permit_project&.discarded?

      raise AASM::InvalidTransition.new(self, aasm.current_event, :default)
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
      return false if DigitalSealChecks.new(self).pending_entries.any?
      return false if template_version_disabled_by_jurisdiction?
      if using_digital_energy_step_code_tool? && !step_code_complete?
        return false
      end

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
      latest_submission_version&.has_request_package_items?
    end

    def stamp_issued_at
      self.issued_at ||= Time.current
    end

    def handle_review_started
      NotificationService.publish_review_started_event(self)
    end

    def handle_finalize_revision_requests
      update(revisions_requested_at: Time.current)
      publish_revision_message(:jurisdiction_message)
      NotificationService.publish_application_revisions_request_event(self)
      reset_submission_block_statuses_for_revision_requests
    end

    def handle_submission
      if aasm.from_state == :revisions_requested
        reset_review_block_statuses_for_changed_fields
      end

      publish_revision_message(:submitter_message)

      self.class.transaction do
        # Lock without reloading the in-flight AASM transition.
        self.class.where(id: id).lock.pick(:id)
        update!(signed_off_at: Time.current)
        requested_version = latest_submission_version
        customizations = PrintReports::Snapshot.customizations(self)

        checklist = step_code_checklist
        # Only snapshot / generate digital checklist PDF when the selected method is the tool
        snapshot_checklist =
          checklist.present? && using_digital_energy_step_code_tool?
        version =
          submission_versions.build(
            form_json:
              PermitApplication::FormJsonService
                .new(permit_application: self, customizations: customizations)
                .call
                .form_json,
            submission_data: self.submission_data,
            step_code_checklist_json:
              (
                if snapshot_checklist
                  step_code.checklist_blueprint.render_as_hash(
                    checklist,
                    view: :extended
                  )
                else
                  nil
                end
              )
          )

        version.id ||= SecureRandom.uuid
        version.created_at = Time.current
        version.report_snapshot =
          PrintReports::Snapshot.capture(
            version,
            customizations: customizations
          )
        version.save!
        assign_revision_fulfillments_to_response_version(
          requested_version,
          version
        )

        send_submit_notifications
      end
    end

    def assign_revision_fulfillments_to_response_version(
      requested_version,
      response_version
    )
      return if requested_version.blank?

      SupportingDocument.where(
        revision_request_id: requested_version.revision_requests.select(:id)
      ).update_all(submission_version_id: response_version.id)
    end

    def publish_revision_message(kind)
      version = latest_submission_version
      return unless version

      version.notes.public_send(kind).find_each(&:publish!)
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

    private

    def reset_submission_block_statuses_for_revision_requests
      version = latest_submission_version
      return if version.blank?

      block_ids =
        version.revision_requests.filter_map do |request|
          next unless request.is_a?(FieldRevisionRequest)

          key =
            request.requirement_json&.[]("key") ||
              request.requirement_json&.[](:key)
          requirement_block_id_from_form_key(key)
        end

      reset_permit_block_statuses_to_draft(block_ids, :submission)
    end

    def reset_review_block_statuses_for_changed_fields
      reset_permit_block_statuses_to_draft(
        changed_requirement_block_ids(
          latest_submission_version&.submission_data,
          submission_data
        ),
        :review
      )
    end

    def reset_permit_block_statuses_to_draft(
      requirement_block_ids,
      collaboration_type
    )
      ids = Array(requirement_block_ids).compact.uniq
      return if ids.empty?

      permit_block_statuses
        .where(
          requirement_block_id: ids,
          collaboration_type: collaboration_type
        )
        .where.not(status: :draft)
        .find_each { |block_status| block_status.update!(status: :draft) }
    end

    def changed_requirement_block_ids(before_data, after_data)
      before_sections = submission_sections(before_data)
      after_sections = submission_sections(after_data)
      ids = []

      (before_sections.keys | after_sections.keys).each do |section_key|
        before_section = section_fields(before_sections[section_key])
        after_section = section_fields(after_sections[section_key])

        (before_section.keys | after_section.keys).each do |field_key|
          next if before_section[field_key] == after_section[field_key]

          block_id = requirement_block_id_from_form_key(field_key)
          ids << block_id if block_id
        end
      end

      ids
    end

    def submission_sections(submission_data)
      data =
        submission_data.is_a?(Hash) ? submission_data.deep_stringify_keys : {}
      sections = data["data"]
      sections.is_a?(Hash) ? sections : {}
    end

    def section_fields(section)
      section.is_a?(Hash) ? section : {}
    end

    def requirement_block_id_from_form_key(key)
      key.to_s[/\|RB([^|]+)/, 1]
    end

    public
  end
end
