# spec/jobs/template_publish_job_spec.rb

require "rails_helper"
require "sidekiq/testing"
require "sidekiq/cron"

RSpec.describe TemplatePublishJob, type: :job do
  before { Sidekiq::Testing.fake! }

  describe "#perform" do
    it "calls the TemplateVersioningService methods during execution" do
      # Mock the TemplateVersioningService methods to control behavior during testing
      allow(TemplateVersioningService).to receive(
        :publish_versions_publishable_now!
      )

      # Perform the job
      described_class.perform_async
      described_class.perform_one

      # Expect the TemplateVersioningService methods to be called
      expect(TemplateVersioningService).to have_received(
        :publish_versions_publishable_now!
      ).once
    end
  end
end
