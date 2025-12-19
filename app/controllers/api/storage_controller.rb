class Api::StorageController < Api::ApplicationController
  skip_after_action :verify_policy_scoped
  before_action :set_record,
                except: %i[
                  upload
                  create_multipart_upload
                  batch_presign_multipart_parts
                  complete_multipart_upload
                  abort_multipart_upload
                ]

  def upload
    authorize :storage, :upload?
    set_rack_response FileUploader.presign_response(:cache, request.env)
  end

  AUTHORIZED_S3_MODELS = {
    "SupportingDocument" => SupportingDocument,
    "RequirementDocument" => RequirementDocument,
    "ProjectDocument" => ProjectDocument,
    "ResourceDocument" => ResourceDocument,
    "ReportDocument" => ReportDocument,
    "DesignDocument" => DesignDocument,
    "PdfForm" => PdfForm,
    "OverheatingDocument" => OverheatingDocument
  }.freeze

  def download
    authorize @record
    render json: { url: @record.file_url }, status: :ok
  end

  # Multipart Upload Actions
  # POST /api/s3/params/multipart
  # Expected params: { filename: "example.jpg", type: "image/jpeg", metadata: { ... } } (metadata optional)
  def create_multipart_upload
    authorize :storage, :create_multipart_upload?
    s3_client = Shrine.storages[:cache].client
    bucket_name = Shrine.storages[:cache].bucket.name
    # Generate a unique key, possibly incorporating the original filename for readability/debugging
    # Ensuring it starts with the cache prefix
    original_filename = params[:filename] || "unknown_filename"
    unique_key =
      "#{Shrine.storages[:cache].prefix}/#{SecureRandom.uuid}-#{original_filename}"

    begin
      response =
        s3_client.create_multipart_upload(
          {
            bucket: bucket_name,
            key: unique_key,
            content_type: params[:type] # Optional: pass content type if available and useful
            # Add metadata if your S3 provider supports it and it's needed, e.g., metadata: params[:metadata]
          }
        )
      render json: {
               uploadId: response.upload_id,
               key: response.key
             },
             status: :ok
    rescue Aws::S3::Errors::ServiceError => _e
      render_error "s3.multipart_init_failed"
    end
  end

  # GET /api/s3/params/multipart/:upload_id/batch
  # Expected params: { key: "s3_object_key", partNumbers: "1,2,3" }
  def batch_presign_multipart_parts
    authorize :storage, :batch_presign_multipart_parts?
    s3_client = Shrine.storages[:cache].client
    bucket_name = Shrine.storages[:cache].bucket.name
    upload_id = params[:upload_id]
    object_key = params[:key] # This is the full key from create_multipart_upload
    part_numbers = params[:partNumbers]&.split(",")&.map(&:to_i)

    if !upload_id || !object_key || part_numbers.blank?
      return render_error "s3.missing_params_for_batch_presign"
    end

    begin
      presigned_urls = {}
      part_numbers.each do |part_number|
        # Note: AWS SDK presign_url for upload_part is not standard.
        # We need to generate a presigned URL for a PUT request for each part.
        # The S3 service itself handles associating these parts with the upload_id.
        presigner = Aws::S3::Presigner.new(client: s3_client)
        url =
          presigner.presigned_url(
            :upload_part,
            bucket: bucket_name,
            key: object_key,
            upload_id: upload_id, # Essential for identifying the part with the multipart upload
            part_number: part_number,
            expires_in: 3600 # 1 hour
          )
        presigned_urls[part_number.to_s] = url
      end
      render json: { presignedUrls: presigned_urls }, status: :ok
    rescue Aws::S3::Errors::ServiceError => _e
      render_error "s3.batch_presign_failed"
    end
  end

  # POST /api/s3/params/multipart/:upload_id/complete
  # Expected params: { key: "s3_object_key", parts: [{ PartNumber: 1, ETag: "etag1" }, ...] }
  def complete_multipart_upload
    authorize :storage, :complete_multipart_upload?
    s3_client = Shrine.storages[:cache].client
    bucket_name = Shrine.storages[:cache].bucket.name
    upload_id = params[:upload_id]
    object_key = params[:key]
    # Ensure parts are in the correct format for the SDK: array of hashes
    # { parts: [{ part_number: 1, etag: "..."}] }
    sdk_parts =
      params[:parts].map do |p|
        { part_number: p[:PartNumber].to_i, etag: p[:ETag] }
      end

    if !upload_id || !object_key || sdk_parts.blank?
      return render_error "s3.missing_params_for_complete"
    end

    begin
      s3_client.complete_multipart_upload(
        {
          bucket: bucket_name,
          key: object_key,
          upload_id: upload_id,
          multipart_upload: {
            parts: sdk_parts
          }
        }
      )
      # The location might not be in response.location for all S3 providers for complete_multipart_upload.
      # It's safer to construct it or get it via a head_object if needed.
      # For now, we'll assume the frontend uses the key and standard S3 URL construction.
      render json: {
               location: "s3://#{bucket_name}/#{object_key}",
               key: object_key
             },
             status: :ok # Simplified location
    rescue Aws::S3::Errors::ServiceError => _e
      render_error "s3.multipart_complete_failed"
    end
  end

  # DELETE /api/s3/params/multipart/:upload_id
  # Expected params: { key: "s3_object_key" }
  def abort_multipart_upload
    authorize :storage, :abort_multipart_upload?
    s3_client = Shrine.storages[:cache].client
    bucket_name = Shrine.storages[:cache].bucket.name
    upload_id = params[:upload_id]
    object_key = params[:key] # Or however the key is passed, query param might be more RESTful: params[:object_key]

    if !upload_id || !object_key
      return render_error "s3.missing_params_for_abort"
    end

    begin
      s3_client.abort_multipart_upload(
        { bucket: bucket_name, key: object_key, upload_id: upload_id }
      )
      render json: {
               message: "Multipart upload aborted successfully."
             },
             status: :ok
    rescue Aws::S3::Errors::ServiceError => _e
      render_error "s3.multipart_abort_failed"
    end
  end

  private

  def set_record
    unless params[:modelId] && AUTHORIZED_S3_MODELS[params[:model]]
      raise ActiveRecord::RecordNotFound
    end

    record_class = AUTHORIZED_S3_MODELS[params[:model]]
    @record = record_class.find(params[:modelId])
  rescue ActiveRecord::RecordNotFound => e
    render_error "misc.not_found_error", { status: :not_found }, e
  end

  def set_rack_response((status, headers, body))
    self.status = status
    self.headers.merge!(headers)
    self.response_body = body
  end
end
