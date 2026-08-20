module StepCodeChecklistControllerConcern
  extend ActiveSupport::Concern

  private

  def archived_step_code_checklist?(checklist, action:, status:)
    return false unless checklist.step_code&.discarded?

    render_error "step_code_checklist.#{action}_archived_error",
                 {
                   status: status,
                   log_args: {
                     errors: "Cannot #{action} checklist of archived Step Code"
                   }
                 }
    true
  end

  def report_generation_requested?
    ActiveModel::Type::Boolean.new.cast(params[:report_generation_requested])
  end

  def enqueue_step_code_report_generation(checklist)
    step_code = checklist.step_code
    return if step_code.blank?

    StepCodeReportGenerationJob.perform_async(
      step_code.id,
      { "checklist_id" => checklist.id }
    )
  end
end
