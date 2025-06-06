class Api::StorageController < Api::ApplicationController
  skip_after_action :verify_authorized, only: %i[upload]
  before_action :set_record, except: %i[upload]

  def upload
    # Authorization is handled by individual model controller policies
    #https://shrinerb.com/docs/plugins/presign_endpoint#calling-from-a-controller
    set_rack_response FileUploader.presign_response(:cache, request.env)
  end

  AUTHORIZED_S3_MODELS = {
    "SupportingDocument" => SupportingDocument,
    "RequirementDocument" => RequirementDocument,
    "ProjectDocument" => ProjectDocument,
    "CommunityDocument" => CommunityDocument
  }.freeze

  def download
    authorize @record
    render json: { url: @record.file_url }, status: :ok
  end

  private

  def set_record
    unless params[:model_id] && AUTHORIZED_S3_MODELS[params[:model]]
      raise ActiveRecord::RecordNotFound
    end

    record_class = AUTHORIZED_S3_MODELS[params[:model]]
    @record = record_class.find(params[:model_id])
  rescue ActiveRecord::RecordNotFound => e
    render_error("misc.not_found_error", { status: :not_found }, e)
  end

  def set_rack_response((status, headers, body))
    self.status = status
    self.headers.merge!(headers)
    self.response_body = body
  end
end
