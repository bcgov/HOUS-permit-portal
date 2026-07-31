# frozen_string_literal: true

require "rails_helper"

RSpec.describe PrintTokenService do
  it "round-trips a payload before expiry" do
    token =
      described_class.generate(
        { step_code_id: "sc-1", permit_application_id: "pa-1" }
      )
    claims = described_class.verify!(token)

    expect(claims[:step_code_id]).to eq("sc-1")
    expect(claims[:permit_application_id]).to eq("pa-1")
  end

  it "rejects expired tokens" do
    token =
      described_class.generate({ step_code_id: "sc-1" }, expires_in: -1.minute)

    expect { described_class.verify!(token) }.to raise_error(
      ActiveSupport::MessageVerifier::InvalidSignature
    )
  end

  it "rejects tampered tokens" do
    token = described_class.generate({ step_code_id: "sc-1" })

    expect { described_class.verify!("#{token}x") }.to raise_error(
      ActiveSupport::MessageVerifier::InvalidSignature
    )
  end
end
