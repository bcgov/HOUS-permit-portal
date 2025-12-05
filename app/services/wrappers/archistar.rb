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

  def get_submission(external_id)
    get("submissions/#{external_id}")
  end

  def get_submission_analytics(external_id)
    get("submissions/#{external_id}/analytics")
  end

  def get_submission_detailed(external_id)
    get("submissions/#{external_id}/detailed")
  end

  def get_submission_pdf_report(external_id)
    r = get("submissions/#{external_id}/document?type=report")
    r["link"]
  end

  def get_submission_viewer_url(external_id)
    r =
      get(
        "submissions/#{external_id}/viewer-link?signed=1&generatoredFor=echeck_user@archistar.pdu"
      )
    r["link"]
  end

  def create_submission(pre_check)
    doc = pre_check.primary_design_document
    return unless doc&.file.present?

    payload = {
      complyCertificateId: pre_check.comply_certificate_id,
      cityKey: "bcbc",
      address: pre_check.formatted_address,
      fileLink:
        doc.file.url(
          response_content_disposition:
            ActionDispatch::Http::ContentDisposition.format(
              disposition: "attachment",
              filename: doc.file.original_filename
            )
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
