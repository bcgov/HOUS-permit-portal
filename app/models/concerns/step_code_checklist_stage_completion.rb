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

  included { before_save :sync_stage_completed_at }

  def stage_status
    StepCodeChecklistStageCompletion.status_for(self)
  end

  private

  def sync_stage_completed_at
    if complete?
      self.stage_completed_at ||= Time.current
    else
      self.stage_completed_at = nil
    end
  end
end
