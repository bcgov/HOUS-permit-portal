# frozen_string_literal: true

# Short-lived signed tokens for headless Chromium (Gotenberg) to load printer-friendly
# checklist pages without a user session.
class PrintTokenService
  PURPOSE = :print_pdf
  DEFAULT_TTL = 15.minutes

  class << self
    def generate(payload, expires_in: DEFAULT_TTL)
      data =
        payload.deep_stringify_keys.merge("exp" => expires_in.from_now.to_i)
      verifier.generate(data)
    end

    def verify!(token)
      data = verifier.verify(token)
      if data["exp"].to_i < Time.current.to_i
        raise ActiveSupport::MessageVerifier::InvalidSignature, "expired"
      end

      data.with_indifferent_access
    end

    def verifier
      Rails.application.message_verifier(PURPOSE)
    end
  end
end
