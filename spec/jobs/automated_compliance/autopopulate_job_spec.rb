require "rails_helper"

RSpec.describe AutomatedCompliance::AutopopulateJob, type: :job do
  let(:permit_application) { create(:permit_application) }
  let(:invalid_permit_application) { build(:permit_application) }

  context "valid compliance requirements" do
    before :each do
      allow(permit_application).to receive(:automated_compliance_unique_unfilled_modules) {
        %w[DigitalSealValidator ParcelInfoExtractor]
      }
    end
    it "enqueues a module if no Job" do
      expect_any_instance_of(AutomatedCompliance::ParcelInfoExtractor).to receive(:call)
      expect { AutomatedCompliance::AutopopulateJob.new.perform(permit_application) }.to have_enqueued_job(
        AutomatedCompliance::DigitalSealValidatorJob,
      )
    end
  end

  it "rejects invalid components" do
    allow(invalid_permit_application).to receive(:automated_compliance_unique_unfilled_modules) { ["Invalid"] }
    expect(Rails.logger).to receive(:error).with("unsafe compliance module called Invalid")
    AutomatedCompliance::AutopopulateJob.new.perform(invalid_permit_application)
  end
end
