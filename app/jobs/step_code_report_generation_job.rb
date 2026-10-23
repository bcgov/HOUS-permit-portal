class StepCodeReportGenerationJob
  include Sidekiq::Worker

  sidekiq_options lock: :until_executed,
                  queue: :file_processing,
                  on_conflict: {
                    client: :reject,
                    server: :reject
                  }

  def self.lock_args(args)
    options = args[1]
    checklist_id =
      options.is_a?(Hash) ? options.stringify_keys["checklist_id"] : nil
    [args[0], checklist_id]
  end

  # Generates a Step Code report PDF without requiring a permit application or submission version
  # Args:
  # - step_code_id: ID of the StepCode record
  # - options: hash with optional overrides like { "outputFilename" => "custom.pdf" }
  def perform(step_code_id, options = {})
    options = (options || {}).with_indifferent_access
    step_code = StepCode.find_by(id: step_code_id)
    return if step_code.blank?

    output_filename =
      options["outputFilename"].presence ||
        "step_code_report_#{step_code.id}.pdf"
    checklist =
      begin
        if options[:checklist_id].present?
          step_code.checklist_for(id: options[:checklist_id])
        elsif options[:stage].present?
          step_code.checklist_for(stage: options[:stage])
        else
          step_code.current_checklist
        end
      rescue NotImplementedError
        nil
      end
    return if checklist.blank?

    PrintReports::Generation.new.step_code(
      step_code,
      checklist,
      filename: output_filename
    )
  end
end
