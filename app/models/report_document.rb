class ReportDocument < FileUploadAttachment
  belongs_to :step_code, inverse_of: :report_documents

  include FileUploader.Attachment(:file)

  def attached_to
    step_code
  end

  def report_generated_event_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" =>
        Constants::NotificationActionTypes::STEP_CODE_REPORT_GENERATED,
      "action_text" =>
        I18n.t(
          "notification.step_code.report_generated",
          default: "Your step code report is ready to download"
        ),
      "object_data" => {
        "report_document_id" => id,
        "filename" => file&.metadata&.dig("filename"),
        "download_url" => file_url
      }
    }
  end
end
