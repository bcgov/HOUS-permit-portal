require "rails_helper"

RSpec.describe Section, type: :model do
  it "is an alias of RequirementTemplateSection" do
    expect(Section).to eq(RequirementTemplateSection)
  end
end
