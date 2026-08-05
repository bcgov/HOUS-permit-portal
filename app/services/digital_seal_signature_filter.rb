class DigitalSealSignatureFilter
  APPROVED_ORGANIZATION_PATTERNS = [
    /\bAIBC\b|Architectural Institute of British Columbia/i,
    /\bEGBC\b|Engineers and Geoscientists(?:\s+of)?\s+British Columbia/i
  ].freeze

  def self.call(signatures)
    Array(signatures).select { |signature| approved?(signature) }
  end

  def self.approved?(signature)
    subject_name =
      signature.dig("signerStatus", "certificateInfo", "subjectName") ||
        signature.dig(:signerStatus, :certificateInfo, :subjectName)

    APPROVED_ORGANIZATION_PATTERNS.any? do |pattern|
      subject_name.to_s.match?(pattern)
    end
  end
end
