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

  def comply_certificates(city_key)
    get("comply-certificates", { cityKey: city_key })
  end

  def create_submission(pre_check)
    payload = {
      complyCertificateId: pre_check.comply_certificate_id,
      cityKey: pre_check.city_key,
      address: pre_check.full_address,
      fileLink: pre_check.primary_design_document&.file_url
    }

    # Add optional fields only if present
    payload[:latitude] = pre_check.latitude if pre_check.latitude.present?
    payload[:longitude] = pre_check.longitude if pre_check.longitude.present?

    post("submissions", payload.to_json)
  end
end
