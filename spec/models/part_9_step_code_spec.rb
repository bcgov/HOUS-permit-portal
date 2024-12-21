require "rails_helper"

RSpec.describe Part9StepCode, type: :model do
  # We do not enforce that permit_applications must be present to reserve room for step code model with no permit application, therefore we do not do it { should belong_to(:permit_application) }

  let!(:permit_application) { create(:permit_application) }
  let!(:step_code) do
    build(:part_9_step_code, permit_application: permit_application)
  end

  before :each do
    allow(permit_application).to receive(:step_code_plan_field) {
      "formSubmissionDataRSTsection422ad829-55d0-4677-b93b-ada73a3d2e0b|RB60d1b79c-02e9-430b-97e0-aaac8a0277e4|test_file"
    }
  end

  context "permit_applications" do
    it "invalid on create if there is no supporting doc with compliance" do
      expect(step_code.valid?).to eq false
    end

    context "supporting doc validator fails" do
      let!(:supporting_doc_with_compliance) do
        create(
          :supporting_document,
          data_key:
            "formSubmissionDataRSTsection422ad829-55d0-4677-b93b-ada73a3d2e0b|RB60d1b79c-02e9-430b-97e0-aaac8a0277e4|test_file",
          permit_application: permit_application,
          compliance_data: {
            status: "failed",
            error:
              "Unable to run digital seal validator integration - Failed to open TCP connection to consigno-verifio-notarius-server:80 (No route to host - connect(2) for \"consigno-verifio-notarius-server\" port 80)"
          }
        )
      end

      before :each do
        expect_any_instance_of(PermitApplication).to receive(
          :active_supporting_documents
        ).and_return(SupportingDocument.all)
      end

      #this is true for part 9, but may need to chagne for part 3
      it "is still valid" do
        step_code.save
        step_code.valid?
      end

      # it "is invalid if it is part 3" do
      #   step_code.save
      #   expect(step_code.errors.full_messages).to eq(
      #     ["Plan version file uploaded failed to verify author and data due to an error with the serivce."],
      #   )
      # end
    end

    context "has supporting doc with compliance" do
      let!(:supporting_doc_with_compliance) do
        create(
          :supporting_document,
          data_key:
            "formSubmissionDataRSTsection422ad829-55d0-4677-b93b-ada73a3d2e0b|RB60d1b79c-02e9-430b-97e0-aaac8a0277e4|test_file",
          permit_application: permit_application,
          compliance_data: {
            status: "success",
            result: SIGNATURE_RESPONSE_STUB
          }
        )
      end

      before :each do
        expect_any_instance_of(PermitApplication).to receive(
          :active_supporting_documents
        ).and_return(SupportingDocument.all)
      end

      it "sets the step code plan values if there is a supporting doc with compliance" do
        expect(step_code.valid?).to eq true
      end

      it "sets plan fields" do
        step_code.save
        expect(step_code.plan_author).to eq("Test - H2 -- Notarius")
      end
    end
  end
end
