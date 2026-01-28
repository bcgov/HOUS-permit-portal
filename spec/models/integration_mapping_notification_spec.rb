require "rails_helper"

RSpec.describe IntegrationMappingNotification, type: :model do
  describe "associations" do
    it { should belong_to(:notifiable) }
    it { should belong_to(:template_version) }
  end

  it "can be created via factory" do
    expect(create(:integration_mapping_notification)).to be_persisted
  end
end
