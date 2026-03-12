require "rails_helper"

RSpec.describe Part3StepCodePolicy, type: :policy do
  it "inherits from StepCodePolicy" do
    expect(described_class < StepCodePolicy).to be true
  end
end
