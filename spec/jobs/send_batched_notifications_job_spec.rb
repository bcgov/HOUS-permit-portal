# spec/jobs/send_batched_integration_mapping_notifications_job_spec.rb

require "rails_helper"
require "sidekiq/testing"

RSpec.describe SendBatchedIntegrationMappingNotificationsJob, type: :job do
  include ActiveSupport::Testing::TimeHelpers

  before do
    Sidekiq::Testing.fake!
    Sidekiq::Worker.clear_all
  end

  after { Sidekiq::Worker.clear_all }

  describe "#perform" do
    # Create necessary test data using FactoryBot
    let!(:external_api_key) { create(:external_api_key) }
    let!(:template_version) { create(:template_version) }
    let!(:user) { create(:user, :review_manager) } # Ensures user is a review manager

    context "when processing ExternalApiKey notifications" do
      let!(:external_notifications) do
        create_list(
          :integration_mapping_notification,
          3,
          notifiable: external_api_key,
          template_version: template_version
        )
      end

      it "sends batched emails and marks notifications as processed for ExternalApiKey" do
        freeze_time do
          # Mock the mailer to prevent actual email delivery
          mailer_double =
            instance_double(
              "ActionMailer::MessageDelivery",
              deliver_later: true
            )
          allow(PermitHubMailer).to receive(
            :send_batched_integration_mapping_notifications
          ).with(
            external_api_key,
            external_notifications.pluck(:id)
          ).and_return(mailer_double)

          # Enqueue the job
          expect { described_class.perform_async }.to change(
            described_class.jobs,
            :size
          ).by(1)

          # Perform the job
          described_class.drain

          # Expect the mailer to have been called with ExternalApiKey and its notification IDs
          expect(PermitHubMailer).to have_received(
            :send_batched_integration_mapping_notifications
          ).with(external_api_key, external_notifications.pluck(:id))

          # Reload notifications to verify they are marked as processed
          external_notifications.each do |notification|
            expect(notification.reload.processed_at).to eq(Time.current)
          end
        end
      end
    end

    context "when processing User notifications" do
      let!(:user_notifications) do
        create_list(
          :integration_mapping_notification,
          2,
          :for_user,
          notifiable: user,
          template_version: template_version
        )
      end

      it "sends batched emails and marks notifications as processed for User (Review Manager)" do
        freeze_time do
          # Mock the mailer to prevent actual email delivery
          mailer_double =
            instance_double(
              "ActionMailer::MessageDelivery",
              deliver_later: true
            )
          allow(PermitHubMailer).to receive(
            :send_batched_integration_mapping_notifications
          ).with(user, user_notifications.pluck(:id)).and_return(mailer_double)

          # Enqueue the job
          expect { described_class.perform_async }.to change(
            described_class.jobs,
            :size
          ).by(1)

          # Perform the job
          described_class.drain

          # Expect the mailer to have been called with User and its notification IDs
          expect(PermitHubMailer).to have_received(
            :send_batched_integration_mapping_notifications
          ).with(user, user_notifications.pluck(:id))

          # Reload notifications to verify they are marked as processed
          user_notifications.each do |notification|
            expect(notification.reload.processed_at).to eq(Time.current)
          end
        end
      end
    end
  end
end
