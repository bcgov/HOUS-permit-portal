class Wrappers::Base
  protected

  def base_url
    raise NotImplementedError, "This method #{__method__} is not implemented"
  end

  def default_headers
    raise NotImplementedError, "This method #{__method__} is not implemented"
  end

  def client
    @client ||= Faraday.new(url: base_url, headers: default_headers)
  end

  def handle_response(response)
    if response.success?
      return(
        response.body.is_a?(Hash) ? response.body : JSON.parse(response.body)
      )
    else
      handle_error(response)
    end
  end

  def get(path, params = {}, skip_handle_response = false)
    response = client.get(path, params)
    skip_handle_response ? response : handle_response(response)
  rescue Faraday::Error => e
    handle_faraday_error(e)
  end

  def post(path, payload = {}, skip_handle_response = false)
    response = client.post(path, payload)
    skip_handle_response ? response : handle_response(response)
  rescue Faraday::Error => e
    handle_faraday_error(e)
  end

  def put(path, payload = {}, skip_handle_response = false)
    response = client.put(path, payload)
    skip_handle_response ? response : handle_response(response)
  rescue Faraday::Error => e
    handle_faraday_error(e)
  end

  def delete(path, skip_handle_response = false)
    response = client.delete(path)
    skip_handle_response ? response : handle_response(response)
  rescue Faraday::Error => e
    handle_faraday_error(e)
  end

  def handle_error(response)
    case response.status
    when 400..499
      raise Errors::WrapperClientError.new(
              "Wrapper client error: #{response.status}. Details: #{response.body}",
              response.status
            )
    when 500..599
      raise Errors::WrapperServerError.new(
              "Wrapper server error: #{response.status}. Details: #{response.body}",
              response.status
            )
    else
      raise "HTTP error: #{response.status}"
    end
  end

  def handle_faraday_error(error)
    Rails.logger.error error.message
    raise Faraday::Error, "Faraday error: #{error.message}"
  end
end
