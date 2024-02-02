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

  def get(path, params = {})
    JSON.parse(client.get(path, params).env.response_body)
  end

  def post(path, payload = {})
    JSON.parse(client.post(path, payload.to_json).env.response_body)
  end

  def put(path, payload = {})
    JSON.parse(client.put(path, payload.to_json).env.response_body)
  end

  def delete(path)
    JSON.parse(client.delete(path).env.response_body)
  end
end
