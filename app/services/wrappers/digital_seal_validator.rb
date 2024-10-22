class Wrappers::DigitalSealValidator < Wrappers::Base
  def base_url
    ENV["CONSIGNO_URL"]
  end

  def default_headers
    {}
  end

  def client
    @client ||=
      Faraday.new(url: base_url) do |f|
        f.request :multipart
        f.request :url_encoded
        f.response :json, content_type: /\bjson$/
        f.adapter Faraday.default_adapter
      end
  end

  def call(*args) # take file and the fie type
    # raise NameError.new("File not found") if !File.exist?(args[0])
    form_data = {
      json: '{"in":"{file}"}',
      file: Faraday::FilePart.new(args[0], args[1])
    }
    response = post("validatePDF", form_data, true)
    if response.success? && response.body.dig("response", "result") == "SUCCESS"
      signatures = response.body.dig("response", "singleSignatureResults") #contains all info to be parsed for display
      OpenStruct.new(success: true, signatures: signatures)
    else
      OpenStruct.new(
        success: false,
        error: response.body.dig("response", "result"),
        signatures: []
      )
    end
  rescue StandardError => e
    OpenStruct.new(success: false, error: "#{e.message}", signatures: [])
  end
end
