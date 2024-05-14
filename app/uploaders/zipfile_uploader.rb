class ZipfileUploader < Shrine
  plugin :validation_helpers

  Attacher.validate do
    validate_max_size Constants::Sizes::FILE_UPLOAD_ZIP_MAX_SIZE * 1024 * 1024 #10 times file attachements is 1GB to start
    validate_extension_inclusion %w[zip], message: :not_valid_file_type
  end

  def generate_location(io, derivative: nil, **options)
    record = options[:record]
    if record
      model = record.class.name.underscore # e.g., 'user' for User model
      identifier = record.id || "temp" # Use 'temp' if record ID is nil

      # Construct the path with support for derivatives
      path = [model, identifier]
      path << derivative.to_s if derivative # Append derivative name if present
      path << super # Call the original generate_location method for the filename

      # Join the path components
      File.join(path)
    else
      super # Fallback to the default behavior if no record is available
    end
  end
end
