class SupportingDocument < ApplicationRecord
  belongs_to :permit_application
  include FileUploader.Attachment(:file)

  scope :file_ids_with_regex, ->(regex_pattern) { where("file_data ->> 'id' ~ ?", regex_pattern) }
  scope :without_compliance, -> { where("compliance_data = '{}' OR compliance_data is NULL") }

  def last_signer
    signer = compliance_data["result"].sort_by { |signer| signer.dig("signatureTimestamp", "date") }&.first

    if signer
      { name: signer["signatureFieldName"], date: signer.dig("signatureTimestamp", "date") }
    else
      { name: nil, date: nil }
    end
  end

  def compliance_message_view
    {
      "data_key" => data_key,
      "message" =>
        compliance_data["error"] ||
          compliance_data["result"].map do |signer|
            "#{signer["signatureFieldName"]} signed at #{signer.dig("signatureTimestamp", "date")}"
          end,
    }
  end

  def file_size
    file_data.dig("metadata", "size")
  end

  def file_name
    file_data.dig("metadata", "filename")
  end

  def file_url
    file&.url(
      public: false,
      expires_in: 3600,
      response_content_disposition: "attachment; filename=\"#{file.original_filename}\"",
    )
  end
end
