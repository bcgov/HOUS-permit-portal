namespace :step_codes do
  desc "Generate standalone PDF reports for step codes without permit applications and without existing reports"
  task generate_missing_reports: :environment do
    scope = StepCode.where(permit_application_id: nil)
    total = scope.count
    puts "Scanning #{total} standalone step codes for missing reports..."

    processed = 0
    scope.find_each(batch_size: 100) do |step_code|
      next if step_code.report_documents.exists?

      begin
        StepCodeReportGenerationJob.perform_async(step_code.id, {})
        processed += 1
      rescue => e
        Rails.logger.error(
          "Failed to enqueue report generation for StepCode #{step_code.id}: #{e.message}"
        )
      end
    end

    puts "Enqueued report generation for #{processed} step codes."
  end
end
