require "rails_helper"

RSpec.describe Api::ReportDocumentsController, type: :controller do
  let(:user) { create(:user, :submitter) }

  before { sign_in user }

  describe "POST #share_with_jurisdiction" do
    it "returns not found when the report document does not exist" do
      post :share_with_jurisdiction, params: { id: "missing-id" }, format: :json

      expect(response).to have_http_status(:not_found)
    end

    it "returns unprocessable entity when the step code has no jurisdiction" do
      report_document =
        create(:report_document, step_code: create(:step_code, creator: user))

      post :share_with_jurisdiction,
           params: {
             id: report_document.id
           },
           format: :json

      expect(response.status).to eq(422)
    end

    it "returns success when sharing with jurisdiction succeeds" do
      jurisdiction = create(:sub_district)
      step_code = create(:step_code, creator: user)
      report_document = create(:report_document, step_code: step_code)
      service =
        instance_double(
          StepCodeReportSharingService,
          send_to_jurisdiction: true
        )

      allow_any_instance_of(StepCode).to receive(:jurisdiction).and_return(
        jurisdiction
      )
      allow(StepCodeReportSharingService).to receive(:new).and_return(service)

      post :share_with_jurisdiction,
           params: {
             id: report_document.id
           },
           format: :json

      expect(response).to have_http_status(:ok)
    end
  end
end
