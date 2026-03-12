require "rails_helper"

RSpec.describe Api::Part9Building::ChecklistsController, type: :controller do
  render_views

  let(:submitter) { create(:user, :submitter) }
  let(:jurisdiction) { create(:sub_district) }
  let(:permit_type) { create(:permit_type) }
  let(:permit_application) do
    create(
      :permit_application,
      submitter: submitter,
      jurisdiction: jurisdiction,
      permit_type: permit_type,
      with_fake_plan_document: true
    )
  end
  let(:step_code) do
    create(
      :part_9_step_code,
      permit_application: permit_application,
      creator: submitter
    )
  end
  let(:checklist) { step_code.pre_construction_checklist }
  let(:step_requirement) do
    PermitTypeRequiredStep.create!(
      jurisdiction: jurisdiction,
      permit_type: permit_type,
      default: true,
      energy_step_required: 3,
      zero_carbon_step_required: 2
    )
  end
  let(:report_payload) do
    {
      "energy" => {
        "proposed_step" => 3,
        "required_step" => 2,
        "max_step" => 5
      },
      "zero_carbon" => {
        "proposed_step" => 2,
        "required_step" => 1,
        "max_step" => 5
      }
    }
  end

  before do
    create(
      :permit_type_submission_contact,
      jurisdiction: jurisdiction,
      permit_type: permit_type
    )
    allow(StepCode.search_index).to receive(:refresh)
    sign_in submitter
    request.headers["ACCEPT"] = "application/json"
    checklist.update!(
      step_requirement: step_requirement,
      compliance_path: "step_code_ers"
    )
  end

  describe "GET #show" do
    it "returns the checklist with compliance report" do
      report = {
        requirement_id: step_requirement.id,
        energy: {
        },
        zero_carbon: {
        }
      }
      stub_part9_compliance_reports(checklist: checklist, reports: [report])
      allow(StepCode::Part9::ComplianceReportBlueprint).to receive(
        :render_as_hash
      ).and_return(report_payload)

      get :show, params: { id: checklist.id }

      expect(response).to have_http_status(:success)
      expect(
        json_response.dig("data", "selected_report", "energy", "proposed_step")
      ).to eq(3)
      expect(StepCode::Compliance::GenerateReports).to have_received(
        :new
      ).at_least(:once)
    end

    it "returns not found for archived step code checklists" do
      step_code.discard

      get :show, params: { id: checklist.id }

      expect(response).to have_http_status(:not_found)
      expect(json_response).to include("data", "meta")
    end

    it "returns forbidden for unauthorized user" do
      sign_in create(:user, :submitter)

      get :show, params: { id: checklist.id }

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH #update" do
    it "updates the checklist, building characteristics, and enqueues report generation" do
      allow(StepCodeReportGenerationJob).to receive(:perform_async)
      report = {
        requirement_id: step_requirement.id,
        energy: {
        },
        zero_carbon: {
        }
      }
      stub_part9_compliance_reports(checklist: checklist, reports: [report])
      allow(StepCode::Part9::ComplianceReportBlueprint).to receive(
        :render_as_hash
      ).and_return(report_payload)

      patch :update,
            params: {
              id: checklist.id,
              report_generation_requested: true,
              step_code_checklist: {
                compliance_path: "step_code_ers",
                status: "complete",
                completed_by: "Advisor",
                building_characteristics_summary_attributes: {
                  roof_ceilings_lines: [{ details: "Roof", rsi: 6.0 }],
                  doors_lines: [{ details: "Door", performance_value: 1.8 }]
                }
              }
            },
            as: :json

      expect(response).to have_http_status(:success)
      expect(
        json_response.dig("data", "building_characteristics_summary")
      ).to be_present
      expect(StepCodeReportGenerationJob).to have_received(:perform_async).with(
        step_code.id
      )
      expect(step_code.reload.complete?).to be(true)
    end

    it "returns error for invalid input" do
      patch :update,
            params: {
              id: checklist.id,
              step_code_checklist: {
                compliance_path: nil
              }
            },
            as: :json

      expect(response).to have_http_status(400)
      expect(json_response.dig("meta", "message", "message")).to include(
        "can't be blank"
      )
    end

    it "returns unprocessable entity for archived step codes" do
      step_code.discard

      patch :update,
            params: {
              id: checklist.id,
              step_code_checklist: {
                compliance_path: "step_code_ers"
              }
            },
            as: :json

      expect(response).to have_http_status(422)
    end
  end
end
