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
end
