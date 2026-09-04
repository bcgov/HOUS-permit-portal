require "rails_helper"

RSpec.describe Reports::StepCodeQuestionInventory do
  it "identifies which questions feed the compliance and characteristics reports" do
    markdown = described_class.markdown

    expect(markdown).to include("Feeds reports")
    expect(markdown).to include("Energy step achieved")
    expect(markdown).to include("Yes")
    expect(markdown).to include("Air changes per hour")
  end
end
