class Api::DigitalSealValidatorController < Api::ApplicationController
  def create
    authorize :digital_seal_validator, :create?
    file = digital_seal_validator_params[:file]

    if file.blank?
      render_error "digital_seal_validator.no_file_error",
                   { status: :unprocessable_entity } and return
    end

    response =
      Wrappers::DigitalSealValidator.new.call(
        file.tempfile.path,
        file.content_type
      )

    approved_signatures = DigitalSealSignatureFilter.call(response.signatures)
    render json: {
             status: approved_signatures.any? ? "found" : "notFound",
             signatures: approved_signatures
           },
           status: :ok
  rescue StandardError => e
    render_error "digital_seal_validator.validation_error", {}, e
  end

  private

  def digital_seal_validator_params
    params.permit(:file)
  end
end
