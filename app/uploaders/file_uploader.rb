class FileUploader < Shrine
  plugin :validation_helpers

  Attacher.promote_block do
    PromoteJob.perform_async(
      self.class.name,
      record.class.name,
      record.id,
      name.to_s,
      file_data
    )
  end

  Attacher.destroy_block do
    DestroyJob.perform_async(self.class.name, self.data)
  end

  Attacher.validate do
    validate_max_size Constants::Sizes::FILE_UPLOAD_MAX_SIZE * 1024 * 1024 # 200 MB to start
    # could be images, excel files, bims, we do not have an exhaustive list right now.
  end

  def generate_location(io, derivative: nil, **options)
    record = options[:record]
    if record
      # If the record is a FileUploadAttachment or its subclass, use the attached_to interface
      return unless record.is_a?(FileUploadAttachment)

      parent_model = record.attached_to_model_name
      parent_id = record.attached_to_id

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
