module StepCodeChecklistStageCompletion
  extend ActiveSupport::Concern

  STAGE_STATUS_NOT_STARTED = "not_started"
  STAGE_STATUS_IN_PROGRESS = "in_progress"
  STAGE_STATUS_COMPLETE = "complete"

  def self.status_for(checklist)
    return STAGE_STATUS_NOT_STARTED if checklist.blank?
    return STAGE_STATUS_COMPLETE if checklist.complete?

    STAGE_STATUS_IN_PROGRESS
  end

  included do
    before_save :sync_stage_completed_at
    validate :all_relevant_sections_complete_when_marking_complete
  end

  class_methods do
    def fully_complete_section_completion_status
      self::DEFAULT_SECTION_COMPLETION_STATUS.transform_values do |section|
        section.merge("complete" => true)
      end
    end
  end

  def stage_status
    StepCodeChecklistStageCompletion.status_for(self)
  end

  def all_relevant_sections_complete?
    (section_completion_status || {}).all? do |_key, value|
      value = value.with_indifferent_access
      !value[:relevant] || value[:complete]
    end
  end

  private

  def sync_stage_completed_at
    if complete?
      self.stage_completed_at ||= Time.current
    else
      self.stage_completed_at = nil
    end
  end

  def all_relevant_sections_complete_when_marking_complete
    return unless will_save_change_to_status?
    return unless complete?
    return if all_relevant_sections_complete?

    errors.add(:base, "all relevant sections must be complete")
  end
end
