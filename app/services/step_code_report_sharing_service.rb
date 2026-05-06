class StepCodeReportSharingService
  attr_reader :report_document, :step_code, :sender_user, :errors

  def initialize(report_document:, sender_user:)
    @report_document = report_document
    @step_code = report_document.step_code
    @sender_user = sender_user
    @errors = []
  end

  def send_to_jurisdiction(jurisdiction_id)
    jurisdiction = Jurisdiction.find_by(id: jurisdiction_id)

    unless jurisdiction
      @errors << "Jurisdiction not found"
      return false
    end

    submission_contact = get_confirmed_submission_contact(jurisdiction)

    unless submission_contact
      @errors << "No confirmed submission contact found in this jurisdiction"
      return false
    end

    send_email_to_contact(jurisdiction, submission_contact)
  end

  def self.confirmed_contact_email_for_jurisdiction(jurisdiction_id)
    SubmissionContact
      .where(jurisdiction_id: jurisdiction_id)
      .confirmed
      .default_contact
      .first
      &.email
  end

  private

  def get_confirmed_submission_contact(jurisdiction)
    jurisdiction.submission_contacts.confirmed.default_contact.first
  end

  def send_email_to_contact(jurisdiction, submission_contact)
    success = send_email_to_recipient(jurisdiction, submission_contact.email)

    log_sharing_activity(jurisdiction, submission_contact) if success

    success
  end

  def send_email_to_recipient(jurisdiction, email)
    PermitHubMailer.send_step_code_report_to_jurisdiction(
      report_document: @report_document,
      step_code: @step_code,
      recipient_email: email,
      jurisdiction: jurisdiction,
      sender_user: @sender_user
    ).deliver_later

    true
  rescue => e
    Rails.logger.error(
      "Failed to send step code report email: #{e.message}\n#{e.backtrace.join("\n")}"
    )
    @errors << "Failed to send email: #{e.message}"
    false
  end

  def log_sharing_activity(jurisdiction, submission_contact)
    Rails.logger.info(
      "Step Code Report Shared - " \
        "Report ID: #{@report_document.id}, " \
        "Step Code ID: #{@step_code.id}, " \
        "Step Code Type: #{@step_code.class.name}, " \
        "Jurisdiction: #{jurisdiction.qualified_name} (#{jurisdiction.id}), " \
        "Timestamp: #{Time.current}"
    )
  end
end
