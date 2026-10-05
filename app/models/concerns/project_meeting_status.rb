module ProjectMeetingStatus
  extend ActiveSupport::Concern

  ACTIVE_STATUSES = %w[open scheduled].freeze

  MANUAL_TRANSITIONS = {
    draft: [],
    open: %i[scheduled withdrawn],
    scheduled: %i[completed withdrawn],
    completed: %i[],
    withdrawn: []
  }.freeze

  STATUS_EVENT_MAP = {
    "scheduled" => :schedule,
    "completed" => :complete,
    "withdrawn" => :withdraw
  }.freeze

  included do
    include AASM

    enum :status,
         { draft: 0, open: 1, scheduled: 2, completed: 3, withdrawn: 4 },
         default: 0

    validate :validate_schedule_requirements, if: :scheduled?
    validate :only_one_active_meeting_request, if: :active?

    # draft → open is only submit_request. Queue after that save commits.
    after_commit :send_requested_webhook, if: :submitted_for_external_api?

    scope :active, -> { where(status: statuses.values_at(*active_statuses)) }

    def self.active_statuses
      ProjectMeetingStatus::ACTIVE_STATUSES
    end

    aasm column: "status", enum: true do
      state :draft, initial: true
      state :open
      state :scheduled
      state :completed
      state :withdrawn

      event :submit_request, before: :stamp_submitted_at do
        transitions from: :draft,
                    to: :open,
                    guard: :can_submit_request?,
                    after: :handle_submission
      end

      event :schedule, before: :stamp_scheduled_at do
        transitions from: :open,
                    to: :scheduled,
                    guard: :can_schedule?,
                    after: :handle_scheduled
      end

      event :complete, before: :stamp_completed_at do
        transitions from: :scheduled, to: :completed
      end

      event :withdraw, before: :stamp_withdrawn_at do
        transitions from: %i[open scheduled completed], to: :withdrawn
      end
    end

    def active?
      self.class.active_statuses.include?(status)
    end

    def submitted?
      status.present? && !draft?
    end

    def terminal?
      completed? || withdrawn?
    end

    def allowed_manual_transitions
      return [] if status.blank?

      ProjectMeetingStatus::MANUAL_TRANSITIONS[status.to_sym] || []
    end

    def stamp_submitted_at
      self.submitted_at ||= Time.current
    end

    def can_submit_request?
      validate_submission_requirements
      only_one_active_meeting_request
      errors.empty?
    end

    def can_schedule?
      validate_schedule_requirements
      errors.empty?
    end

    def stamp_scheduled_at
      self.scheduled_at ||= Time.current
    end

    def stamp_completed_at
      self.completed_at ||= Time.current
    end

    def stamp_withdrawn_at
      self.withdrawn_at ||= Time.current
    end

    def handle_submission
      permit_project&.mark_as_unviewed
      NotificationService.publish_project_meeting_submitted_event(self)
      NotificationService.publish_project_meeting_request_received_event(self)
      NotificationService.publish_property_information_request_received_event(
        self
      )
    end

    def handle_scheduled
      NotificationService.publish_project_meeting_scheduled_event(self)
    end

    def validate_schedule_requirements
      errors.add(:confirmed_date, :blank) if confirmed_date.blank?
      errors.add(:contact_method, :blank) if contact_method.blank?

      if contact_method_videoconference? && meeting_url.blank?
        errors.add(:meeting_url, :blank)
      end
    end

    def only_one_active_meeting_request
      return if permit_project_id.blank?

      active_status_values =
        self.class.statuses.values_at(*self.class.active_statuses)
      active_meetings =
        self
          .class
          .where(permit_project_id: permit_project_id)
          .where(status: active_status_values)
      active_meetings = active_meetings.where.not(id: id) if id.present?

      if active_meetings.exists?
        errors.add(:permit_project, :active_project_meeting_exists)
      end
    end

    def submitted_for_external_api?
      saved_change_to_status? && open? && status_before_last_save == "draft"
    end

    def send_requested_webhook
      payload = {
        "project_meeting_id" => id,
        "permit_project_id" => permit_project_id,
        "status" => status,
        "occurred_at" => submitted_at.to_i * 1000
      }

      jurisdiction
        .active_external_api_keys
        .where(sandbox_id: sandbox_id)
        .where(api_version: "v2")
        .where.not(webhook_url: [nil, ""])
        .each do |external_api_key|
          PermitWebhookJob.perform_async(
            external_api_key.id,
            Constants::Webhooks::Events::ProjectMeeting::REQUESTED,
            payload
          )
        end
    end
  end
end
