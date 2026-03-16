require "rails_helper"
require "sidekiq/testing"

RSpec.describe CheckExpiringApiKeysJob, type: :job do
  before { Sidekiq::Testing.fake! }
  include ActiveSupport::Testing::TimeHelpers

  it "sends an email and records a notification for matching interval" do
    travel_to(Time.zone.parse("2026-03-01 12:00:00")) do
      key =
        create(
          :external_api_key,
          expired_at: 30.days.from_now,
          revoked_at: nil,
          notification_email: "notify@example.com"
        )

      mail = double("Mail", deliver: true)
      allow(PermitHubMailer).to receive(
        :notify_api_key_status_change
      ).and_return(mail)

      expect { described_class.new.perform }.to change(
        ApiKeyExpirationNotification,
        :count
      ).by(1)

      expect(PermitHubMailer).to have_received(
        :notify_api_key_status_change
      ).with(key, :expiring, 30)
    end
  end

  it "does not send the same interval twice" do
    travel_to(Time.zone.parse("2026-03-01 12:00:00")) do
      key =
        create(
          :external_api_key,
          expired_at: 14.days.from_now,
          revoked_at: nil,
          notification_email: "notify@example.com"
        )
      ApiKeyExpirationNotification.create!(
        external_api_key: key,
        notification_interval_days: 14,
        sent_at: Time.current
      )

      allow(PermitHubMailer).to receive(:notify_api_key_status_change)

      expect { described_class.new.perform }.not_to change(
        ApiKeyExpirationNotification,
        :count
      )
      expect(PermitHubMailer).not_to have_received(
        :notify_api_key_status_change
      )
    end
  end

  it "rescues mail/record errors and continues" do
    travel_to(Time.zone.parse("2026-03-01 12:00:00")) do
      create(
        :external_api_key,
        expired_at: 5.days.from_now,
        revoked_at: nil,
        notification_email: "notify@example.com"
      )
      mail = double("Mail")
      allow(mail).to receive(:deliver).and_raise(StandardError, "mailfail")
      allow(PermitHubMailer).to receive(
        :notify_api_key_status_change
      ).and_return(mail)

      expect { described_class.new.perform }.not_to raise_error
    end
  end
end
