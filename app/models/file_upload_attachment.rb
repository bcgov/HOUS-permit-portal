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

  def file_data
    value =
      begin
        super
      rescue StandardError
        read_attribute(:file_data)
      end
    return value if value.is_a?(Hash)

    # If value is a String, try to parse as JSON
    if value.is_a?(String)
      begin
        JSON.parse(value)
      rescue JSON::ParserError
        {}
      end
    else
      {}
    end
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
end
