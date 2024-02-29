class Api::StorageController < Api::ApplicationController
  skip_after_action :verify_authorized
  skip_after_action :verify_policy_scoped

  def upload
    #https://shrinerb.com/docs/plugins/presign_endpoint#calling-from-a-controller
    set_rack_response FileUploader.presign_response(:cache, request.env)
  end

  AUTHORIZED_S3_MODELS = %w[SupportingDocument StepCode]
  def download
    if params[:id].start_with?("cache/")
      url = Shrine.storages[:cache].url(params[:id].slice(6..-1), public: false, expires_in: 3600)
      render json: { url: }, status: :ok
    elsif params[:model_id] && AUTHORIZED_S3_MODELS.include?(params[:model])
      record = params[:model].safe_constantize.find(params[:model_id])
      authorize record
      render json: { url: record.file_url }, status: :ok
    else
      render_error("misc.not_found_error", status: :not_found)
    end
  rescue ActiveRecord::RecordNotFound
    render_error("misc.not_found_error", status: :not_found)
  end

  def delete
    #TODO: change if the item is a cache or storage client
    #if the object is already persisted to storage, we remove it off supporting documents itself
    if params[:id].start_with?("cache/")
      s3_client = Shrine.storages[:cache].client
      url =
        s3_client.presigned_url(
          :delete_object,
          bucket: ENV["BCGOV_OBJECT_STORAGE_BUCKET"],
          key: params[:id].slice(6..-1),
          expires_in: 3600,
        )
      render json: { url: }, status: :ok
    elsif params[:model_id] && AUTHORIZED_S3_MODELS.include?(params[:model])
      record = params[:model].safe_constantize.find(params[:model_id])
      authorize record
      raise "Need to implement"
      # render json: { url: record.file_url}, status: :ok
    else
      render_error("misc.not_found_error", status: :not_found)
    end
  rescue ActiveRecord::RecordNotFound
    render_error("misc.not_found_error", status: :not_found)
  end

  private

  def set_rack_response((status, headers, body))
    self.status = status
    self.headers.merge!(headers)
    self.response_body = body
  end
end
