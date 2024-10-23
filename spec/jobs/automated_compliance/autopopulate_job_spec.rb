require "rails_helper"

RSpec.describe AutomatedCompliance::AutopopulateJob, type: :job do
  let(:permit_application) { create(:permit_application) }

  before :each do
    allow_any_instance_of(PermitApplication).to receive(
      :formatted_compliance_data
    ) { {} }
  end

  context "valid compliance requirements" do
    before :each do
      #use any instance of since sidekiq takes inthe id and does a find
      allow_any_instance_of(PermitApplication).to receive(
        :automated_compliance_unique_unfilled_modules
      ) { %w[DigitalSealValidator ParcelInfoExtractor] }

      expect(WebsocketBroadcaster).to receive(:push_update_to_relevant_users)
      #calls a module if no job
      expect_any_instance_of(
        AutomatedCompliance::ParcelInfoExtractor
      ).to receive(:call)
    end
    it "enqueues a Job if available" do
      expect {
        AutomatedCompliance::AutopopulateJob.new.perform(permit_application.id)
      }.to enqueue_sidekiq_job(AutomatedCompliance::DigitalSealValidatorJob)
    end
  end

  it "rejects invalid components" do
    allow_any_instance_of(PermitApplication).to receive(
      :automated_compliance_unique_unfilled_modules
    ) { ["Invalid"] }
    expect(Rails.logger).to receive(:error).with(
      "unsafe compliance module called Invalid"
    )
    AutomatedCompliance::AutopopulateJob.new.perform(permit_application.id)
  end
end
