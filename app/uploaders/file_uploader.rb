class FileUploader < Shrine
  plugin :validation_helpers

  Attacher.validate do
    validate_max_size Constants::Sizes::FILE_UPLOAD_MAX_SIZE * 1024 * 1024 #100 MB to start
    #could be images, excel files, bims, we do not have an exhaustive list right now.
  end

  def generate_location(io, derivative: nil, **options)
    record = options[:record]
    if record
      #The default is (supporting document) model, but we want to ignore it: model = record.class.name.underscore
      parent_model = record.permit_application.class.name.underscore #permit application nesting
      parent_id = record.permit_application.id
      identifier = record.id || "temp" # Use 'temp' if record ID is nil
      # Construct the path with support for derivatives
      path = [parent_model, parent_id, identifier]
      path << derivative.to_s if derivative # Append derivative name if present
      if record.file_data && record.file_data["storage"] == "cache"
        path << record[:file_data]["id"] #get the same name as it did in the cache
      else
        path << super # Call the original generate_location method for the filename
      end

      # Join the path components
      File.join(path)
    else
      super # Fallback to the default behavior if no record is available
    end
  end
end
