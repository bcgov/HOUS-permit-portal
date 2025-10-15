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
        "step_code_id" => step_code_id,
        "step_code_type" => step_code.type,
        "report_document_id" => id,
        "filename" => file&.metadata&.dig("filename"),
        "download_url" => file_url
      }
    }
  end

  # Share this report with the step_code's associated jurisdiction
  # Returns true if successful, false otherwise
  def share_with_jurisdiction(sender_user:)
    return false unless step_code.jurisdiction

    service =
      StepCodeReportSharingService.new(
        report_document: self,
        sender_user: sender_user
      )

    service.send_to_jurisdiction(step_code.jurisdiction.id)
  end
end
