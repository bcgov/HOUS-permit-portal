namespace :print_reports do
  desc "Restore a submission's missing/invalid generated PDFs and affected cumulative ZIPs"
  task recover: :environment do
    id = ENV.fetch("SUBMISSION_VERSION_ID")
    version = SubmissionVersion.find(id)
    results = PrintReports::Recovery.call(version)
    results.each do |result|
      puts({ submission_version_id: id }.merge(result).to_json)
    end
    if results.any? { |result| result[:status] == "blocked" }
      abort "Recovery incomplete; see blocked items above."
    end
  end
end
