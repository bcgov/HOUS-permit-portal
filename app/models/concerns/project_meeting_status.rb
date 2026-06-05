module ProjectMeetingStatus
  extend ActiveSupport::Concern

  ACTIVE_STATUSES = %w[draft open].freeze

  MANUAL_TRANSITIONS = {
    draft: [],
    open: %i[scheduled closed],
    scheduled: %i[completed closed],
    completed: %i[],
    closed: []
  }.freeze

  STATUS_EVENT_MAP = {
    "scheduled" => :schedule,
    "completed" => :complete,
    "closed" => :close
  }.freeze

  included do
    include AASM

    enum :status,
         { draft: 0, open: 1, scheduled: 2, completed: 3, closed: 4 },
         default: 0

    validate :validate_schedule_requirements, if: :scheduled?
    validate :only_one_active_meeting_request, if: :active?

    scope :active, -> { where(status: statuses.values_at(*active_statuses)) }

    def self.active_statuses
      ProjectMeetingStatus::ACTIVE_STATUSES
    end

    aasm column: "status", enum: true do
      state :draft, initial: true
      state :open
      state :scheduled
      state :completed
      state :closed

      event :submit_request, before: :stamp_submitted_at do
        transitions from: :draft,
                    to: :open,
                    guard: :can_submit_request?,
                    after: :handle_submission
      end

      event :schedule, before: :stamp_scheduled_at do
        transitions from: :open, to: :scheduled, guard: :can_schedule?
      end

      event :complete, before: :stamp_completed_at do
        transitions from: :scheduled, to: :completed
      end

      event :close, before: :stamp_closed_at do
        transitions from: %i[open scheduled completed], to: :closed
      end
    end

    def active?
      self.class.active_statuses.include?(status)
    end

    def submitted?
      status.present? && !draft?
    end

    def terminal?
      completed? || closed?
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

    def stamp_closed_at
      self.closed_at ||= Time.current
    end

    def handle_submission
      permit_project&.mark_as_unviewed
      NotificationService.publish_project_meeting_submitted_event(self)
      NotificationService.publish_project_meeting_request_received_event(self)
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
  end
end
