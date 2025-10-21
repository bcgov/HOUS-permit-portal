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

    # Add coordinates - fetched from LTSA using PID when available
    # Using Vancouver coordinates as fallback if PID lookup fails or is unavailable
    payload[:latitude] = pre_check.latitude
    payload[:longitude] = pre_check.longitude
    r = post("submissions", payload.to_json)
    r["certificate_no"]
  end
end
