class Api::StorageController < Api::ApplicationController
  skip_after_action :verify_authorized
  skip_after_action :verify_policy_scoped

  def upload
    #https://shrinerb.com/docs/plugins/presign_endpoint#calling-from-a-controller
    set_rack_response FileUploader.presign_response(:cache, request.env)
  end

  AUTHORIZED_S3_MODELS = {
    "SupportingDocument" => SupportingDocument,
    "StepCode" => StepCode
  }.freeze

  def download
    if params[:id].start_with?("cache/")
      url =
        Shrine.storages[:cache].url(
          params[:id].slice(6..-1),
          public: false,
          expires_in: 3600
        )
      render json: { url: }, status: :ok
    elsif params[:model_id] && AUTHORIZED_S3_MODELS[params[:model]]
      record_class = AUTHORIZED_S3_MODELS[params[:model]]
      record = record_class.find(params[:model_id])
      authorize record
      render json: { url: record.file_url }, status: :ok
    else
      render_error("misc.not_found_error", status: :not_found)
    end
  rescue ActiveRecord::RecordNotFound => e
    render_error("misc.not_found_error", { status: :not_found }, e)
  end

  def delete
    if params[:id].start_with?("cache/")
      # if we use files instead of simple files, we'd need to send back a presigned url directly
      Shrine.storages[:cache].delete(params[:id])
      render json: { id: params[:id] }, status: :ok
    elsif params[:model_id] && AUTHORIZED_S3_MODELS.include?(params[:model])
      # if the object is already persisted to storage, we don't delete it.  The deletion happens during cleanup jobs.  See history if we need to bring this back.
      render json: { id: params[:id] }, status: :ok
    else
      render_error("misc.not_found_error", { status: :not_found }, e)
    end
  rescue ActiveRecord::RecordNotFound => e
    render_error("misc.not_found_error", { status: :not_found }, e)
  end

  private

  def set_rack_response((status, headers, body))
    self.status = status
    self.headers.merge!(headers)
    self.response_body = body
  end
end
