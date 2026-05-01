class PermitApplicationGeneratedFileNamer
  DATE_FORMAT = "%Y-%m-%d"

  def initialize(permit_application, date: Time.zone.today)
    @permit_application = permit_application
    @date = date
  end

  def permit_application_pdf(version_number:)
    "#{base_name}_permit-application_v#{version_number}.pdf"
  end

  def step_code_checklist_pdf(version_number:)
    "#{base_name}_step-code-checklist_v#{version_number}.pdf"
  end

  def supporting_documents_zip
    "#{base_name}_supporting-documents.zip"
  end

  def permit_application_json
    "#{base_name}_permit-application.json"
  end

  private

  attr_reader :permit_application, :date

  def base_name
    [permit_application_identifier, formatted_date].map do |segment|
        safe_segment(segment)
      end
      .join("_")
  end

  def permit_application_identifier
    permit_application.number.presence || permit_application.id
  end

  def formatted_date
    date.to_date.strftime(DATE_FORMAT)
  end

  def safe_segment(segment)
    segment
      .to_s
      .strip
      .gsub(/\s+/, "_")
      .gsub(/[^A-Za-z0-9._-]/, "_")
      .gsub(/_+/, "_")
      .delete_prefix("_")
      .delete_suffix("_")
  end
end
