module PermitProjectState
  extend ActiveSupport::Concern

  MANUAL_TRANSITIONS = {
    draft: [],
    queued: %i[waiting in_progress closed],
    waiting: %i[queued in_progress ready permit_issued active closed],
    in_progress: %i[queued waiting ready permit_issued active closed],
    ready: %i[permit_issued waiting closed],
    permit_issued: %i[active waiting closed ready],
    active: %i[complete waiting closed queued],
    complete: %i[active queued],
    closed: %i[queued]
  }.freeze

  STATE_EVENT_MAP = {
    "queued" => :enqueue,
    "in_progress" => :begin_progress,
    "ready" => :mark_ready,
    "permit_issued" => :issue_permit,
    "active" => :start_construction,
    "complete" => :finish,
    "closed" => :close_project,
    "waiting" => :put_on_hold,
    "draft" => :return_to_draft
  }.freeze

  included do
    include AASM

    before_save :update_queue_clock, if: :state_changed?

    enum :state,
         {
           draft: 0,
           queued: 1,
           waiting: 2,
           in_progress: 3,
           ready: 4,
           permit_issued: 5,
           active: 6,
           complete: 7,
           closed: 8
         },
         default: 0

    aasm column: "state", enum: true do
      state :draft, initial: true
      state :queued
      state :waiting
      state :in_progress
      state :ready
      state :permit_issued
      state :active
      state :complete
      state :closed

      event :enqueue do
        transitions from: :draft,
                    to: :queued,
                    guard: :has_submitted_permit?,
                    after: :stamp_enqueued_at
        transitions from: %i[waiting in_progress active complete closed],
                    to: :queued
      end

      event :begin_progress do
        transitions from: %i[queued waiting ready permit_issued active],
                    to: :in_progress
      end

      event :mark_ready do
        transitions from: %i[queued waiting in_progress permit_issued],
                    to: :ready
      end

      event :issue_permit do
        transitions from: %i[queued waiting ready], to: :permit_issued
      end

      event :start_construction do
        transitions from: %i[queued waiting permit_issued complete], to: :active
      end

      event :finish do
        transitions from: :active, to: :complete
      end

      event :close_project do
        transitions from: %i[
                      queued
                      waiting
                      in_progress
                      ready
                      permit_issued
                      active
                    ],
                    to: :closed
      end

      event :put_on_hold do
        transitions from: %i[queued in_progress ready permit_issued active],
                    to: :waiting
      end

      event :return_to_draft do
        transitions from: :queued, to: :draft, guard: :no_post_draft_permits?
      end
    end

    acts_as_taggable_on :flags

    def self.kanban_states
      %w[
        queued
        waiting
        in_progress
        ready
        permit_issued
        active
        complete
        closed
      ].freeze
    end

    def self.off_board_states
      %w[draft].freeze
    end

    def self.terminal_states
      %w[complete closed].freeze
    end

    def self.our_court_states
      %w[queued in_progress ready].freeze
    end

    def on_kanban?
      self.class.kanban_states.include?(state)
    end

    def terminal?
      self.class.terminal_states.include?(state)
    end

    def allowed_manual_transitions
      MANUAL_TRANSITIONS[state.to_sym] || []
    end

    def sorted_application_statuses
      permit_applications
        .kept
        .sort_by { |pa| -pa.pertinence_score }
        .map { |pa| { id: pa.id, status: pa.status, nickname: pa.nickname } }
    end

    def rollup_status
      sorted_application_statuses.first&.dig(:status) || "empty"
    end

    def inbox_sorted_application_statuses
      permit_applications
        .kept
        .sort_by { |pa| -pa.inbox_pertinence_score }
        .map { |pa| { id: pa.id, status: pa.status, nickname: pa.nickname } }
    end

    def inbox_rollup_status
      inbox_sorted_application_statuses.first&.dig(:status) || "empty"
    end

    def stamp_enqueued_at
      update_column(:enqueued_at, Time.current) if enqueued_at.nil?
    end

    def has_submitted_permit?
      permit_applications.kept.any?(&:submitted?)
    end

    def no_post_draft_permits?
      permit_applications.kept.none? { |pa| !pa.new_draft? }
    end

    def update_queue_clock
      was_our_court = self.class.our_court_states.include?(state_was)
      is_our_court = self.class.our_court_states.include?(state)

      if was_our_court && queue_clock_started_at.present?
        self.queue_time_seconds += (Time.current - queue_clock_started_at).to_i
        self.queue_clock_started_at = nil
      end

      self.queue_clock_started_at = Time.current if is_our_court
    end
  end
end
