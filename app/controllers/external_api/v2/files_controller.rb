class ExternalApi::V2::FilesController < ExternalApi::ApplicationController
  def create
    authorize :file, policy_class: ExternalApi::FilePolicy

    upload = params[:file]
    filename = reference_filename(upload)
    return render_file_error("file is missing") if filename.blank?

    extension = File.extname(filename).delete_prefix(".").downcase
    if FileUploader::BLOCKED_EXTENSIONS.include?(extension)
      return render_file_error("file extension is not allowed")
    end

    max_bytes = Constants::Sizes::FILE_UPLOAD_MAX_SIZE * 1024 * 1024
    if upload.size.to_i > max_bytes
      return render_file_error("file is too large")
    end

    location = "#{SecureRandom.uuid}/#{filename}"
    uploaded = FileUploader.upload(upload, :cache, location: location)

    render_success(
      {
        id: uploaded.id,
        name: filename,
        type: uploaded.mime_type.presence || upload.content_type,
        size: uploaded.size || upload.size
      },
      nil,
      { status: :created }
    )
  end

  private

  def expected_api_version
    "v2"
  end

  def reference_filename(upload)
    return if upload.blank? || !upload.respond_to?(:original_filename)

    name = File.basename(upload.original_filename.to_s)
    name = name.delete("\0").gsub(/[[:cntrl:]]/, "").strip
    return if name.blank? || name == "." || name == ".."

    name
  end

  def render_file_error(message)
    render_error nil,
                 {
                   status: :unprocessable_entity,
                   meta: {
                     message: message,
                     type: "error"
                   }
                 }
  end
end
