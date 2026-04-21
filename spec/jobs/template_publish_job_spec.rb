# spec/jobs/template_publish_job_spec.rb

require "rails_helper"
require "sidekiq/testing"
require "sidekiq/cron"

RSpec.describe TemplatePublishJob, type: :job, search: true do
  before { Sidekiq::Testing.fake! }

  it "has no unique lock so retries are not suppressed" do
    opts = described_class.get_sidekiq_options
    expect(opts["lock"] || opts[:lock]).to be_nil
  end

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
