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

  BLOCKED_EXTENSIONS = %w[
    exe
    bat
    cmd
    com
    msi
    scr
    pif
    sh
    bash
    csh
    ksh
    js
    jsx
    ts
    vbs
    vbe
    wsf
    wsh
    ps1
    html
    htm
    xhtml
    php
    py
    rb
    pl
    asp
    aspx
    jsp
    dll
    so
    dylib
    jar
    war
    css
  ].freeze

  Attacher.validate do
    validate_max_size Constants::Sizes::FILE_UPLOAD_MAX_SIZE * 1024 * 1024
    validate_extension_exclusion BLOCKED_EXTENSIONS
  end

  def generate_location(io, derivative: nil, **options)
    record = options[:record]
    return super unless record

    # Build path based on record type
    path = build_storage_path(record)
    path << derivative.to_s if derivative

    # Use cache filename if available, otherwise generate new
    filename = extract_cache_filename(record) || super
    path << filename

    File.join(path)
  end

  private

  def build_storage_path(record)
    if record.is_a?(FileUploadAttachment)
      # For FileUploadAttachment subclasses, use the attached_to interface
      # e.g., "permit_application/123/doc-456"
      [
        record.attached_to_model_name,
        record.attached_to_id,
        record.id || "temp"
      ]
    else
      # For other records, use simple model/id structure
      # e.g., "part9_step_code/data_entry/789"
      [record.class.name.underscore, record.id || "temp"]
    end
  end

  def extract_cache_filename(record)
    return nil unless record.respond_to?(:file_data)

    file_data = record.file_data
    return nil unless file_data.is_a?(Hash) && file_data["storage"] == "cache"

    file_data["id"]
  end
end
