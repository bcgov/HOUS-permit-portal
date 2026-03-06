require "rails_helper"

# Specs in this file have access to a helper object that includes
# the SiteConfigurationHelper. For example:
#
# describe SiteConfigurationHelper do
#   describe "string concat" do
#     it "concats two strings with spaces" do
#       expect(helper.concat_strings("this","that")).to eq("this that")
#     end
#   end
# end
RSpec.describe SiteConfigurationHelper, type: :helper do
  it "is defined" do
    expect(SiteConfigurationHelper).to be_a(Module)
  end
end
