class Integrations::DigitalSealValidator
  attr_accessor :client, :api_path
  def initialize
    parsed_url = URI.parse(ENV["CONSIGNO_URL"])
    @client =
      Faraday.new(ENV["CONSIGNO_URL"]) do |f|
        f.request :multipart
        f.request :url_encoded
        f.response :json, content_type: /\bjson$/
        f.adapter Faraday.default_adapter
      end
    @api_path = parsed_url.path
  end

  def call(*args) #take file and the fie type
    # raise NameError.new("File not found") if !File.exist?(args[0])
    form_data = { json: '{"in":"{file}"}', file: Faraday::FilePart.new(args[0], args[1]) }
    response = client.post("#{api_path}/validatePDF", form_data)
    if response.success? && response.body.dig("response", "result") == "SUCCESS"
      signatures = response.body.dig("response", "singleSignatureResults") #contains all info to be parsed for display
      OpenStruct.new(success: true, signatures: signatures)
    else
      OpenStruct.new(success: false, error: response.body.dig("response", "result"), signatures: [])
    end
  rescue StandardError => e
    OpenStruct.new(success: false, error: "#{e.message}", signatures: [])
  end
end
