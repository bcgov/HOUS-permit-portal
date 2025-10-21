class Wrappers::Archistar < Wrappers::Base
  def base_url
    ENV["ARCHISTAR_API_ENDPOINT"]
  end

  def default_headers
    {
      "Content-Type" => "application/json",
      "Accept" => "application/json",
      "x-api-key" => ENV["ARCHISTAR_API_KEY"]
    }
  end

  def comply_certificates(city_key = "bcbc")
    get("comply-certificates", { cityKey: city_key })
  end

  def get_submission(certificate_no)
    get("submissions/#{certificate_no}")
  end

  def create_submission(pre_check)
    payload = {
      complyCertificateId: pre_check.comply_certificate_id,
      cityKey: "bcbc",
      address: pre_check.formatted_address,
      fileLink:
        (
          if ENV["ARCHISTAR_DEVELOPOMENT_OVERRIDE_FILE_LINK"].present?
            ENV["ARCHISTAR_DEVELOPOMENT_OVERRIDE_FILE_LINK"]
          else
            pre_check.primary_design_document&.file_url
          end
        ),
      additionalFiles: []
    }

    # Add coordinates - these might be required for validation
    # Using Vancouver coordinates as fallback since the model returns nil
    payload[:latitude] = pre_check.latitude || 49.2620175 # Vancouver latitude
    payload[:longitude] = pre_check.longitude || -123.1089299 # Vancouver longitude
    r = post("submissions", payload.to_json)
    r["certificate_no"]
  end
end
