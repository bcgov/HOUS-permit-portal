class StepCodeReportSharingService
  attr_reader :report_document, :step_code, :sender_user, :errors

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

    # Get confirmed submission contacts for the jurisdiction
    submission_contacts = get_confirmed_submission_contacts(jurisdiction)

    if submission_contacts.empty?
      @errors << "No confirmed submission contacts found for this jurisdiction"
      return false
    end

    # Send to all confirmed contacts
    send_emails(jurisdiction, submission_contacts)
  end

  # Send report to a specific email address with jurisdiction context
  def send_to_email(email, jurisdiction_id)
    jurisdiction = Jurisdiction.find_by(id: jurisdiction_id)

    unless jurisdiction
      @errors << "Jurisdiction not found"
      return false
    end

    unless valid_email?(email)
      @errors << "Invalid email address"
      return false
    end

    send_email_to_recipient(jurisdiction, email)
  end

  # Get list of jurisdictions that have confirmed submission contacts
  # This can be used in the UI to populate the jurisdiction selector
  def self.jurisdictions_with_confirmed_contacts
    Jurisdiction
      .joins(:permit_type_submission_contacts)
      .where.not(permit_type_submission_contacts: { confirmed_at: nil })
      .distinct
      .order(:name)
  end

  # Get confirmed submission contacts for a jurisdiction
  def self.confirmed_contacts_for_jurisdiction(jurisdiction_id)
    PermitTypeSubmissionContact
      .where(jurisdiction_id: jurisdiction_id)
      .where.not(confirmed_at: nil)
      .pluck(:email)
  end

  private

  def get_confirmed_submission_contacts(jurisdiction)
    jurisdiction.permit_type_submission_contacts.where.not(confirmed_at: nil)
  end

  def send_emails(jurisdiction, submission_contacts)
    results = []

    submission_contacts.each do |contact|
      results << send_email_to_recipient(jurisdiction, contact.email)
    end

    # Log the sharing activity
    log_sharing_activity(jurisdiction, submission_contacts.map(&:email))

    results.all?
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

  def log_sharing_activity(jurisdiction, recipient_emails)
    Rails.logger.info(
      "Step Code Report Shared - " \
        "Report ID: #{@report_document.id}, " \
        "Step Code ID: #{@step_code.id}, " \
        "Jurisdiction: #{jurisdiction.qualified_name} (#{jurisdiction.id}), " \
        "Recipients: #{recipient_emails.join(", ")}, " \
        "Sender: #{@sender_user.name} (#{@sender_user.id}), " \
        "Timestamp: #{Time.current}"
    )
  end

  def valid_email?(email)
    email.present? && email.match?(URI::MailTo::EMAIL_REGEXP)
  end
end
