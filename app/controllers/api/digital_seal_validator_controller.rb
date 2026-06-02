class Api::DigitalSealValidatorController < Api::ApplicationController
  APPROVED_DIGITAL_SEAL_ORGANIZATION_PATTERNS = [
    /\bAIBC\b|Architectural Institute of British Columbia/i,
    /\bEGBC\b|Engineers and Geoscientists(?:\s+of)?\s+British Columbia/i
  ].freeze

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

    approved_signatures = approved_digital_seal_signatures(response.signatures)
    render json: {
             status: approved_signatures.any? ? "found" : "notFound",
             signatures: approved_signatures
           },
           status: :ok
  rescue StandardError => e
    render_error "digital_seal_validator.validation_error", {}, e
  end

  private

  def approved_digital_seal_signatures(signatures)
    Array(signatures).select do |signature|
      approved_digital_seal_organization?(signature)
    end
  end

  def approved_digital_seal_organization?(signature)
    subject_name =
      signature.dig("signerStatus", "certificateInfo", "subjectName") ||
        signature.dig(:signerStatus, :certificateInfo, :subjectName)

    APPROVED_DIGITAL_SEAL_ORGANIZATION_PATTERNS.any? do |pattern|
      subject_name.to_s.match?(pattern)
    end
  end

  def digital_seal_validator_params
    params.permit(:file)
  end
end
