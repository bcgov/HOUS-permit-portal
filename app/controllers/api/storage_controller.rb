class Api::StorageController < ActionController::API
  include BaseControllerMethods
  before_action :authenticate_user!

  def upload
    #https://shrinerb.com/docs/plugins/presign_endpoint#calling-from-a-controller
    set_rack_response FileUploader.presign_response(:cache, request.env)
  end

  def download
    #TODO: change if the item is a cache or storage client
    s3_client = Shrine.storages[:cache].client
    url = Shrine.storages[:cache].url(params[:key], public: false, expires_in: 3600)
    render json: { url: }, status: :ok
  end

  def delete
    #TODO: change if the item is a cache or storage client
    s3_client = Shrine.storages[:cache].client
    url =
      s3_client.presigned_url(
        :delete_object,
        bucket: ENV["BCGOV_OBJECT_STORAGE_BUCKET"],
        key: params[:key],
        expires_in: 3600,
      )
    render json: { url: }, status: :ok
  end

  private

  def set_rack_response((status, headers, body))
    self.status = status
    self.headers.merge!(headers)
    self.response_body = body
  end
end
