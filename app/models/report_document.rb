class ReportDocument < FileUploadAttachment
  belongs_to :step_code, inverse_of: :report_documents
  belongs_to :checklist, polymorphic: true, optional: true

  validates :checklist_id,
            uniqueness: {
              scope: :checklist_type
            },
            allow_nil: true

  include FileUploader.Attachment(:file)
  prepend FilenamePreservingFileUrl

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
          default: "Your Step Code report is ready to download"
        ),
      "object_data" => {
        "step_code_id" => step_code_id,
        "step_code_type" => step_code.type,
        "report_document_id" => id,
        "checklist_id" => checklist_id,
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
