class Api::DigitalSealValidatorController < Api::ApplicationController
  skip_after_action :verify_authorized
  skip_after_action :verify_policy_scoped

  def create
    file = params[:file]

    if file.blank?
      render json: { error: "No file provided" }, status: :unprocessable_entity
      return
    end

    validator = Wrappers::DigitalSealValidator.new
    # file is an ActionDispatch::Http::UploadedFile
    result = validator.call(file.tempfile.path, file.content_type)

    if result.success
      render json: { status: "success", signatures: result.signatures }
    else
      render json: {
               status: "error",
               error: result.error
             },
             status: :unprocessable_entity
    end
  end
end
