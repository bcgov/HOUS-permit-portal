class StepCodeReportSharingService
  attr_reader :report_document, :step_code, :sender_user, :errors

  # Map step code types to their corresponding permit type codes
  STEP_CODE_TYPE_TO_PERMIT_TYPE = {
    "Part9StepCode" => "low_residential",
    "Part3StepCode" => "medium_residential"
  }.freeze

  def initialize(report_document:, sender_user:)
    @report_document = report_document
    @step_code = report_document.step_code
    @sender_user = sender_user
    @errors = []
  end

  # Send report to a specific jurisdiction by ID
  def send_to_jurisdiction(jurisdiction_id)
    jurisdiction = Jurisdiction.find_by(id: jurisdiction_id)

    unless jurisdiction
      @errors << "Jurisdiction not found"
      return false
    end

    # Get the appropriate permit type based on step code type
    permit_type_code = get_permit_type_code

    # Find the confirmed submission contact for this permit type
    submission_contact =
      get_confirmed_submission_contact(jurisdiction, permit_type_code)

    unless submission_contact
      @errors << "No confirmed submission contact found for #{permit_type_code} in this jurisdiction"
      return false
    end

    # Send to the one relevant contact
    send_email_to_contact(jurisdiction, submission_contact)
  end

  # Get confirmed submission contact email for a jurisdiction and permit type
  # permit_type_code should be "low_residential" (Part 9) or "medium_residential" (Part 3)
  def self.confirmed_contact_email_for_jurisdiction(
    jurisdiction_id,
    permit_type_code
  )
    permit_type = PermitType.find_by(code: permit_type_code)
    return nil unless permit_type

    PermitTypeSubmissionContact
      .where(jurisdiction_id: jurisdiction_id, permit_type: permit_type)
      .where.not(confirmed_at: nil)
      .first
      &.email
  end

  private

  def get_permit_type_code
    STEP_CODE_TYPE_TO_PERMIT_TYPE[@step_code.class.name]
  end

  def get_confirmed_submission_contact(jurisdiction, permit_type_code)
    permit_type = PermitType.find_by(code: permit_type_code)
    return nil unless permit_type

    jurisdiction
      .permit_type_submission_contacts
      .where(permit_type: permit_type)
      .where.not(confirmed_at: nil)
      .first
  end

  def send_email_to_contact(jurisdiction, submission_contact)
    success = send_email_to_recipient(jurisdiction, submission_contact.email)

    # Log the sharing activity
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
        "Permit Type: #{submission_contact.permit_type.code}, " \
        "Timestamp: #{Time.current}"
    )
  end
end
