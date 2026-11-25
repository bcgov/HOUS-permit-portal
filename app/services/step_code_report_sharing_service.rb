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

    contacts = jurisdiction.confirmed_submission_contacts
    if contacts.empty?
      @errors << "No confirmed submission contact found in this jurisdiction"
      return false
    end

    results =
      contacts.map do |contact|
        send_email_to_recipient(jurisdiction, contact.email)
      end
    log_sharing_activity(jurisdiction) if results.any?
    results.any?
  end

  private

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
      "Failed to send Step Code report email: #{e.message}\n#{e.backtrace.join("\n")}"
    )
    @errors << "Failed to send email: #{e.message}"
    false
  end

  def log_sharing_activity(jurisdiction)
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
