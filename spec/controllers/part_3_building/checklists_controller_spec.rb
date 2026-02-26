require "rails_helper"

RSpec.describe Api::Part3Building::ChecklistsController, type: :controller do
  render_views

  let(:submitter) { create(:user, :submitter) }
  let(:jurisdiction) { create(:sub_district, heating_degree_days: 2910) }
  let(:permit_application) do
    create(
      :permit_application,
      submitter: submitter,
      jurisdiction: jurisdiction
    )
  end
  let(:step_code) do
    create(
      :part_3_step_code,
      permit_application: permit_application,
      creator: submitter
    )
  end
  let(:checklist) { step_code.checklist }

  before do
    sign_in submitter
    request.headers["ACCEPT"] = "application/json"
    allow(StepCode.search_index).to receive(:refresh)
  end

  describe "GET #show" do
    it "returns the checklist with compliance report" do
      report_hash = {
        "performance" => {
          "energy" => {
            "proposed_step" => 3
          }
        }
      }
      stub_part3_compliance_report(
        checklist: checklist,
        report_hash: report_hash
      )

      get :show, params: { id: checklist.id }

      expect(response).to have_http_status(:success)
      expect(json_response.dig("data", "compliance_report")).to eq(report_hash)
      expect(StepCode::Part3::V1::GenerateReport).to have_received(:new).with(
        checklist: checklist
      )
    end

    it "returns not found for archived step code checklists" do
      step_code.discard

      get :show, params: { id: checklist.id }

      expect(response).to have_http_status(:not_found)
      expect(json_response.dig("meta", "message", "message")).to eq(
        "Cannot view checklist of archived step code. Please restore the step code first."
      )
    end

    it "returns forbidden for unauthorized user" do
      sign_in create(:user, :submitter)

      get :show, params: { id: checklist.id }

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH #update" do
    it "updates the checklist and enqueues report generation" do
      allow(StepCodeReportGenerationJob).to receive(:perform_async)
      report_hash = {
        "performance" => {
          "energy" => {
            "proposed_step" => 2
          }
        }
      }
      stub_part3_compliance_report(
        checklist: checklist,
        report_hash: report_hash
      )

      patch :update,
            params: {
              id: checklist.id,
              report_generation_requested: true,
              checklist: {
                heating_degree_days: 3220,
                completed_by_email: "energy@example.com",
                section_completion_status: {
                  step_code_summary: {
                    complete: true
                  }
                }
              }
            },
            as: :json

      expect(response).to have_http_status(:success)
      expected_climate_zone =
        StepCode::Part3::V0::Requirements::References::ClimateZone.value(3220)
      expect(json_response.dig("data", "climate_zone")).to eq(
        expected_climate_zone
      )
      expect(StepCodeReportGenerationJob).to have_received(:perform_async).with(
        step_code.id
      )
      expect(checklist.reload.complete?).to be(true)
    end

    it "returns error for invalid input" do
      patch :update,
            params: {
              id: checklist.id,
              checklist: {
                completed_by_email: "invalid_email"
              }
            },
            as: :json

      expect(response).to have_http_status(400)
      expect(json_response.dig("meta", "message", "message")).to include(
        "is invalid"
      )
    end

    it "returns unprocessable entity for archived step codes" do
      step_code.discard

      patch :update,
            params: {
              id: checklist.id,
              checklist: {
                completed_by_email: "energy@example.com"
              }
            },
            as: :json

      expect(response).to have_http_status(422)
    end
  end
end
