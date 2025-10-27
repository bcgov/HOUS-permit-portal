class FileUploadAttachment < ApplicationRecord
  self.abstract_class = true

  # This method must be implemented by all subclasses
  # It should return the parent model that the file is attached to
  def attached_to
    raise NotImplementedError, "#{self.class} must implement attached_to method"
  end

  # Convenience method to get the parent model's class name for path construction
  def attached_to_model_name
    attached_to.class.name.underscore
  end

  # Convenience method to get the parent model's ID for path construction
  def attached_to_id
    attached_to.id
  end

  def file_id
    file_data.dig("id")
  end

  def file_size
    file_data.dig("metadata", "size")
  end

  def file_name
    file_data.dig("metadata", "filename")
  end

  def file_type
    file_data.dig("metadata", "mime_type")
  end

  def file_url
    # Ensure file_data has an id by generating a temp one if needed
    file_data["id"] = SecureRandom.uuid if file_data && !file_data["id"]

    file&.url(
      public: false,
      expires_in: 3600,
      response_content_disposition:
        "attachment; filename=\"#{file.original_filename}\""
    )
  end

  # Downloads the report file to a temporary file
  # Returns the path to the temp file, or nil if download fails
  def download_to_tempfile
    temp_file = Tempfile.new(["report", File.extname(file_name)])
    temp_file.binmode
    url = URI.parse(file_url)

    Net::HTTP.start(
      url.host,
      url.port,
      use_ssl: url.scheme == "https"
    ) do |http|
      request = Net::HTTP::Get.new(url)
      http.request(request) do |response|
        response.read_body { |chunk| temp_file.write(chunk) }
      end
    end

    temp_file.close
    temp_file.path
  rescue => e
    Rails.logger.error(
      "Failed to download report file (ID: #{id}): #{file_url} - #{e.message}"
    )
    temp_file&.close
    temp_file&.unlink
    nil
  end
end
