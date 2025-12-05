class Api::DigitalSealValidatorController < Api::ApplicationController
  def create
    authorize :digital_seal_validator, :create?
    file = params[:file]

    if file.blank?
      render_error "misc.no_file_provided", status: :unprocessable_entity
      return
    end

    validator = Wrappers::DigitalSealValidator.new
    # file is an ActionDispatch::Http::UploadedFile
    result = validator.call(file.tempfile.path, file.content_type)

    if result.success
      render_success(
        nil,
        nil,
        {
          meta: {
            status: "success",
            signatures: result.signatures
          },
          status: :ok
        }
      )
    else
      render_error "digital_seal_validator.validation_error",
                   {
                     message_opts: {
                       error_message: result.error
                     },
                     status: :unprocessable_entity
                   }
    end
  end
end
