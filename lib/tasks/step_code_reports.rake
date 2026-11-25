namespace :step_codes do
  desc "Generate standalone PDF reports for complete checklists without a report"
  task generate_missing_reports: :environment do
    scope = StepCode.where(permit_application_id: nil)
    total = scope.count
    puts "Scanning #{total} standalone Step Codes for missing reports..."

    processed = 0
    scope.find_each(batch_size: 100) do |step_code|
      StepCode.preload_checklists([step_code])
      step_code.checklists.each do |checklist|
        next unless checklist.complete?
        next if checklist.report_document.present?

        begin
          StepCodeReportGenerationJob.perform_async(
            step_code.id,
            { "checklist_id" => checklist.id }
          )
          processed += 1
        rescue => e
          Rails.logger.error(
            "Failed to enqueue report generation for StepCode #{step_code.id} checklist #{checklist.id}: #{e.message}"
          )
        end
      end
    end

    puts "Enqueued report generation for #{processed} checklists."
  end
end
