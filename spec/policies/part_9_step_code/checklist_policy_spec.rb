require "rails_helper"

RSpec.describe Part9StepCode::ChecklistPolicy, type: :policy do
  it "inherits from StepCode::ChecklistPolicy" do
    expect(described_class < StepCode::ChecklistPolicy).to be true
  end
end
