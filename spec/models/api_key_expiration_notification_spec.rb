require "rails_helper"

RSpec.describe ApiKeyExpirationNotification, type: :model do
  describe "associations" do
    it { should belong_to(:external_api_key) }
  end

  describe "validations" do
    it { should validate_presence_of(:notification_interval_days) }
    it { should validate_presence_of(:sent_at) }

    it "enforces uniqueness per external_api_key and interval" do
      key = create(:external_api_key)
      described_class.create!(
        external_api_key: key,
        notification_interval_days: 30,
        sent_at: Time.current
      )

      dup =
        described_class.new(
          external_api_key: key,
          notification_interval_days: 30,
          sent_at: Time.current
        )

      expect(dup).not_to be_valid
      expect(dup.errors[:external_api_key_id]).to include(
        "notification for this interval has already been sent"
      )
    end
  end
end
