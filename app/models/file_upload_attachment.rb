class FileUploadAttachment < ApplicationRecord
  self.abstract_class = true

  # Virus scan status enum
  # Provides scopes: .pending, .clean, .infected
  # Provides methods: .pending?, .clean?, .infected?, .pending!, .clean!, .infected!
  enum :scan_status,
       { pending: "pending", clean: "clean", infected: "infected" },
       default: :pending

  # Scopes for filtering by file availability
  # Use .with_file to get only records that have valid, accessible files
  # Use .without_file to find orphaned records (failed uploads, virus removals, etc.)
  scope :with_file,
        -> { where.not(file_data: nil).where.not(scan_status: :infected) }
  scope :without_file,
        -> { where(file_data: nil).or(where(scan_status: :infected)) }

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

  # Additional scan status helper
  def scan_complete?
    clean? || infected?
  end

  # Check if the file is available for use
  # Returns false if file_data is missing or file was infected
  def file_available?
    file_data.present? && file_data["id"].present? && !infected?
  end

  # Inverse of file_available? for clarity
  def file_unavailable?
    !file_available?
  end

  # Safe file_url that returns nil instead of erroring when file is unavailable
  def file_url_safe
    return nil unless file_available?

    file_url
  rescue StandardError
    nil
  end

  # Notification data for failed file upload
  def upload_failed_notification_data(file_name_override = nil)
    current_file_name = file_name_override || file_name || "Unknown file"

    data = {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::FILE_UPLOAD_FAILED,
      "action_text" =>
        I18n.t("notification.file_upload_failed", file_name: current_file_name),
      "object_data" => {
        "file_name" => current_file_name,
        "record_type" => self.class.name,
        "record_id" => id
      }
    }

    if attached_to.is_a?(PermitApplication)
      data["object_data"]["permit_application_id"] = attached_to.id
    elsif attached_to.respond_to?(:permit_application) &&
          attached_to.permit_application.present?
      data["object_data"][
        "permit_application_id"
      ] = attached_to.permit_application.id
    end

    data
  end
end
