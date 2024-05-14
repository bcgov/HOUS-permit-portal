class ZipfileJob
  include Sidekiq::Worker
  sidekiq_options queue: :file_processing

  def perform(permit_application_id)
    PdfGenerationJob.new.perform(permit_application_id)
    SupportingDocumentsZipper.new(permit_application_id).perform
  end
end
