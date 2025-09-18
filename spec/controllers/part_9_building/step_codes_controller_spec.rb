require "rails_helper"

RSpec.describe Api::Part9Building::StepCodesController, type: :controller do
  render_views

  let(:submitter) { create(:user, :submitter) }
  let(:jurisdiction) { create(:sub_district) }
  let(:permit_application) do
    create(
      :permit_application,
      submitter: submitter,
      jurisdiction: jurisdiction
    )
  end
  let(:permit_application_with_fake_plan_document) do
    create(
      :permit_application,
      submitter: submitter,
      jurisdiction: jurisdiction,
      with_fake_plan_document: true
    )
  end

  before do
    sign_in submitter
    request.headers["ACCEPT"] = "application/json"
  end

  describe "POST #create" do
    context "when permit_application_id provided (find or create)" do
      it "finds an existing Part9StepCode" do
        existing =
          Part9StepCode.create!(
            creator: submitter,
            permit_application: permit_application_with_fake_plan_document
          )

        post :create,
             params: {
               step_code: {
                 permit_application_id:
                   permit_application_with_fake_plan_document.id,
                 pre_construction_checklist_attributes: {
                   compliance_path: "step_code_ers",
                   data_entries_attributes: []
                 }
               }
             },
             as: :json
        expect(response).to have_http_status(:success)
        expect(JSON.parse(response.body).dig("data", "id")).to eq(existing.id)
      end

      it "creates a new Part9StepCode when none exists" do
        expect {
          post :create,
               params: {
                 step_code: {
                   pre_construction_checklist_attributes: {
                     compliance_path: "step_code_ers",
                     data_entries_attributes: []
                   }
                 }
               },
               as: :json
        }.to change(Part9StepCode, :count).by(1)

        expect(response).to have_http_status(:success)
      end
    end

    context "standalone creation (no permit_application_id)" do
      it "creates a new Part9StepCode" do
        expect {
          post :create,
               params: {
                 step_code: {
                   pre_construction_checklist_attributes: {
                     compliance_path: "step_code_ers",
                     data_entries_attributes: []
                   }
                 }
               },
               as: :json
        }.to change(Part9StepCode, :count).by(1)
        expect(response).to have_http_status(:success)
      end
    end

    context "validation failure bubbles to render_error" do
      it "returns error when permit application is missing plan document (requires_plan_document)" do
        # Do not attach a plan document to the permit_application factory
        post :create,
             params: {
               step_code: {
                 permit_application_id: permit_application.id,
                 pre_construction_checklist_attributes: {
                   compliance_path: "step_code_ers",
                   data_entries_attributes: []
                 }
               }
             },
             as: :json

        expect(response.status).to eq(400)
        body = JSON.parse(response.body)
        expect(body.dig("meta", "message", "message")).to include(
          "file is missing"
        )
      end
    end
  end
end
