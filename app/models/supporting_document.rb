class SupportingDocument < ApplicationRecord
  belongs_to :permit_application
  belongs_to :submission_version, optional: true

  include FileUploader.Attachment(:file)

  validate :validate_submission_version_data_key

  scope :file_ids_with_regex,
        ->(regex_pattern) { where("file_data ->> 'id' ~ ?", regex_pattern) }
  scope :without_compliance,
        -> { where("compliance_data = '{}' OR compliance_data IS NULL") }
  validates :submission_version_id,
            uniqueness: {
              scope: %i[permit_application_id data_key],
              allow_nil: true
            }

  APPLICATION_PDF_DATA_KEY = "permit_application_pdf"
  CHECKLIST_PDF_DATA_KEY = "step_code_checklist_pdf"

  def last_signer
    if compliance_data["result"] &&
         signer =
           compliance_data["result"]
             .sort_by { |signer| signer.dig("signatureTimestamp", "date") }
             &.last
      parse_signature(signer)
    else
      { name: nil, date: nil }
    end
  end

  def compliance_message_view
    if compliance_data["result"]
      signers =
        compliance_data["result"]
          .map { |signer| parse_signature(signer) }
          .group_by { |signer| signer[:subjectName] }
          .map do |subjectName, signaturesArray|
            signaturesArray.sort_by { |signer| signer[:date] }&.last
          end
          .sort_by { |signer| signer[:date] }
          .reverse
          .map { |signer| summarizeString(signer) }

      {
        "id" => file_id,
        "data_key" => data_key,
        "message" => "Signers validated: #{signers.join(",")}"
      }
    else
      {
        "id" => file_id,
        "data_key" => data_key,
        "message" => compliance_data["error"],
        "error" => true
      }
    end
  end

  def parse_signature(signer)
    {
      name:
        signer.dig("signerStatus", "certificateInfo", "commonName") ||
          signer["signatureFieldName"],
      subjectName: signer.dig("signerStatus", "certificateInfo", "subjectName"),
      subject:
        signer
          .dig("signerStatus", "certificateInfo", "subjectName")
          &.split(",")
          &.filter { |i| i.starts_with?("OU=") }
          &.map { |i| i[3..-1] }
          &.join(","),
      date:
        Time
          .parse(signer.dig("signatureTimestamp", "date"))
          .in_time_zone(Rails.application.config.time_zone)
          .strftime("%Y-%m-%d %H:%M:%S %Z")
    }
  end

  def standardized_filename
    name =
      "#{permit_application.number}_#{data_key.split("|").last.gsub("_file", "")}"

    extension = file_data["id"].split(".").last

    # appending id to ensure uniqueness
    name =
      (
        if submission_version.present?
          "#{name}_v#{submission_version.version_number}_#{id}"
        else
          "#{name}_#{id}"
        end
      )

    "#{name}.#{extension}"
  end

  def summarizeString(parsed_signature)
    "#{parsed_signature[:name]} (#{parsed_signature[:subject]}) signed at #{parsed_signature[:date]}"
  end

  def file_id
    file_data.dig("id")
  end

  def file_size
    file_data.dig("metadata", "size")
  end

  def file_name
    file_data.dig("metadata", "filename")
  end

  def file_type
    file_data.dig("metadata", "mime_type")
  end

  def file_url
    file&.url(
      public: false,
      expires_in: 3600,
      response_content_disposition:
        "attachment; filename=\"#{file.original_filename}\""
    )
  end

  STATIC_DOCUMENT_DATA_KEYS = [
    APPLICATION_PDF_DATA_KEY,
    CHECKLIST_PDF_DATA_KEY
  ].freeze

  def validate_submission_version_data_key
    unless submission_version.present? &&
             !STATIC_DOCUMENT_DATA_KEYS.include?(data_key)
      return
    end

    self.errors.add(
      :data_key,
      I18n.t(
        "activerecord.errors.models.supporting_document.attributes.data_key.submission_version_data_key"
      )
    )
  end
end
