module Reports
  module Cache
    TTL = 24.hours

    module_function

    def fetch(key, range, force: false)
      cache_key = key_for(key, range)
      unless force
        cached = Rails.cache.read(cache_key)
        return cached if cached.present?
      end

      previous = Rails.cache.read(cache_key)
      payload = Registry.build(key, range).call
      Rails.cache.write(cache_key, payload, expires_in: TTL)
      payload
    rescue StandardError => e
      Rails.logger.error(
        "[Reports::Cache] #{key} #{range.preset}: #{e.class}: #{e.message}"
      )
      raise e if previous.blank?

      previous.with_indifferent_access.merge(
        "refresh_failed" => true,
        "refresh_error" => e.message
      )
    end

    def key_for(key, range)
      "reports/#{key}/#{range.preset}"
    end
  end
end
