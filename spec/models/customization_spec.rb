require "rails_helper"

RSpec.describe Customization, type: :model do
  it "is an alias of JurisdictionTemplateVersionCustomization" do
    expect(Customization).to eq(JurisdictionTemplateVersionCustomization)
  end
end
