require "rails_helper"

RSpec.describe Part3StepCode::ChecklistPolicy, type: :policy do
  it "inherits from StepCode::ChecklistPolicy" do
    expect(described_class < StepCode::ChecklistPolicy).to be true
  end
end
