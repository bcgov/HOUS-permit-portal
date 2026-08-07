class SupportingDocumentsZipDownloadJob
  include Sidekiq::Worker
  sidekiq_options queue: :file_processing

  def perform(permit_application_id, document_ids, request_id, user_id)
    zipfile_url = nil
    zipfile_name = nil

    SupportingDocumentsZipper
      .new(permit_application_id, document_ids: document_ids)
      .with_zip do |path|
        zipfile_name = File.basename(path)
        File.open(path.to_s, "rb") do |file|
          uploaded = ZipfileUploader.new(:store).upload(file)
          zipfile_url =
            uploaded.url(
              public: false,
              expires_in: 3600,
              response_content_disposition:
                ContentDisposition.attachment(zipfile_name)
            )
        end
      end

    broadcast(
      permit_application_id,
      request_id,
      user_id,
      zipfile_url: zipfile_url,
      zipfile_name: zipfile_name
    )
  rescue StandardError => e
    Rails.logger.error(
      "SupportingDocumentsZipDownloadJob failed for #{permit_application_id}: #{e.message}"
    )
    broadcast(permit_application_id, request_id, user_id, error: true)
  end

  private

  def broadcast(
    permit_application_id,
    request_id,
    user_id,
    zipfile_url: nil,
    zipfile_name: nil,
    error: false
  )
    WebsocketBroadcaster.push_update_to_relevant_users(
      [user_id],
      Constants::Websockets::Events::PermitApplication::DOMAIN,
      Constants::Websockets::Events::PermitApplication::TYPES[
        :selective_zip_ready
      ],
      {
        id: permit_application_id,
        request_id: request_id,
        zipfile_url: zipfile_url,
        zipfile_name: zipfile_name,
        error: error
      }
    )
  end
end
