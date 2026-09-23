class PdfGenerationJob
  include Sidekiq::Worker
  sidekiq_options lock: :until_executed,
                  queue: :file_processing,
                  on_conflict: {
                    client: :reject,
                    server: :reject
                  }

  def self.lock_args(args)
    # only lock on the first argument, which is the permit application id
    # this will prevent multiple jobs from running for the same permit application
    [args[0]]
  end

  def perform(permit_application_id, version_ids = nil)
    permit_application = PermitApplication.find(permit_application_id)
    return if permit_application.blank?

    versions = permit_application.submission_versions.order(:created_at, :id)
    versions = versions.where(id: version_ids) if version_ids
    generator = PrintReports::Generation.new
    versions.each { |version| generator.submission(version) }
  end
end
