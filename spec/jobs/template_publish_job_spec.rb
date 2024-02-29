# spec/jobs/template_publish_job_spec.rb

require "rails_helper"
require "sidekiq/testing"
require "sidekiq/cron"

RSpec.describe TemplatePublishJob, type: :job do
  before { Sidekiq::Testing.fake! }

  describe "Sidekiq Cron schedule" do
    it "is scheduled to run at 12:01 AM Vancouver time" do
      # Ensure the Sidekiq Cron job is scheduled
      expect(Sidekiq::Cron::Job.find("template_publish")).to be_present

      cron_expression = Sidekiq::Cron::Job.find("template_publish").cron

      # Expect the cron expression to match 12:01 AM Vancouver time
      expect(cron_expression).to eq("1 0 * * * America/Vancouver")
    end
  end

  describe "#perform" do
    it "calls the TemplateVersioningService methods during execution" do
      # Mock the TemplateVersioningService methods to control behavior during testing
      allow(TemplateVersioningService).to receive(:publish_versions_publishable_now!)

      # Perform the job
      described_class.perform_async
      described_class.perform_one

      # Expect the TemplateVersioningService methods to be called
      expect(TemplateVersioningService).to have_received(:publish_versions_publishable_now!).once
    end
  end
end
