require "rails_helper"

RSpec.describe StepCode, type: :model do
  # We do not enforce that permit_applications must be present to reserve room for step code model with no permit application, therefore we do not do it { should belong_to(:permit_application) }

  let!(:permit_application) { create(:permit_application) }
  let!(:step_code) { build(:step_code, permit_application: permit_application) }

  context "permit_applications" do
    it "invalid on create if there is no supporting doc with compliance" do
      allow(permit_application).to receive(:step_code_plan_field) { "test" }
      expect(step_code.valid?).to eq false
    end

    context "has supporting doc with compliance" do
      let!(:supporting_doc_with_compliance) do
        create(
          :supporting_document,
          data_key: "test",
          permit_application: permit_application,
          compliance_data: {
            status: "success",
            result: SIGNATURE_RESPONSE_STUB,
          },
        )
      end
      before :each do
        allow(permit_application).to receive(:step_code_plan_field) { "test" }
      end

      it "sets the step code plan values if there is a supporting doc with compliance" do
        expect(step_code.valid?).to eq true
      end

      it "sets plan fields" do
        step_code.save
        expect(step_code.plan_author).to eq("Signature1")
      end
    end
  end
end
