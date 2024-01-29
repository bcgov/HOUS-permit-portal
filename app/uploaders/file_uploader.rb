class FileUploader < Shrine
  plugin :validation_helpers

  Attacher.validate do
    validate_max_size 100 * 1024 * 1024 #100 MB to start
    validate_mime_type %w[application/pdf image/jpeg image/png], message: :not_valid_file_type
  end
end
