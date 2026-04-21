require "rails_helper"

RSpec.describe Api::Part3Building::StepCodesController, type: :controller do
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

  before do
    sign_in submitter
    request.headers["ACCEPT"] = "application/json"
  end

  describe "POST #create" do
    context "when permit_application_id is provided (find or create)" do
      it "finds the existing Part3StepCode for the permit application" do
        existing =
          Part3StepCode.create!(
            permit_application: permit_application,
            creator: submitter
          )

        post :create,
             params: {
               step_code: {
                 permit_application_id: permit_application.id,
                 checklist_attributes: {
                   section_completion_status: {
                   }
                 }
               }
             },
             as: :json

        expect(response).to have_http_status(:success)
        expect(JSON.parse(response.body).dig("data", "id")).to eq(existing.id)
      end

      it "creates a new Part3StepCode for the permit application when none exists" do
        expect {
          post :create,
               params: {
                 step_code: {
                   permit_application_id: permit_application.id,
                   checklist_attributes: {
                     section_completion_status: {
                     }
                   }
                 }
               },
               as: :json
        }.to change(Part3StepCode, :count).by(1)

        expect(response).to have_http_status(:success)
        expect(JSON.parse(response.body).dig("data", "checklist")).to be_present
      end
    end

    context "when creating standalone (no permit_application_id)" do
      it "creates and returns success" do
        expect {
          post :create,
               params: {
                 step_code: {
                   checklist_attributes: {
                     section_completion_status: {
                     }
                   }
                 }
               },
               as: :json
        }.to change(Part3StepCode, :count).by(1)

        expect(response).to have_http_status(:success)
      end

      it "sets climate zone based on heating degree days" do
        jurisdiction.update!(heating_degree_days: 2910)

        post :create,
             params: {
               step_code: {
                 jurisdiction_id: jurisdiction.id,
                 checklist_attributes: {
                   section_completion_status: {
                   }
                 }
               }
             },
             as: :json

        body = JSON.parse(response.body)
        checklist = body.dig("data", "checklist")
        expected_climate_zone =
          StepCode::Part3::V0::Requirements::References::ClimateZone.value(
            jurisdiction.heating_degree_days
          )
        expect(checklist["heating_degree_days"]).to eq(
          jurisdiction.heating_degree_days
        )
        expect(checklist["climate_zone"]).to eq(expected_climate_zone)
      end

      it "renders error when model raises validation error" do
        allow(Part3StepCode).to receive(:create!).and_raise(
          ActiveRecord::RecordInvalid.new(
            Part3StepCode.new.tap { |r| r.errors.add(:base, "boom") }
          )
        )

        post :create,
             params: {
               step_code: {
                 checklist_attributes: {
                   section_completion_status: {
                   }
                 }
               }
             },
             as: :json

        expect(response.status).to satisfy { |s| [200, 400].include?(s) }
        body = JSON.parse(response.body)
        expect(body.dig("meta", "message", "message")).to include("boom")
      end
    end
  end

  describe "GET #show" do
    let(:step_code) do
      create(
        :part_3_step_code,
        permit_application: permit_application,
        creator: submitter
      )
    end

    it "returns the step code with compliance report" do
      report_hash = {
        "performance" => {
          "energy" => {
            "proposed_step" => 3
          }
        }
      }
      stub_part3_compliance_report(
        checklist: step_code.checklist,
        report_hash: report_hash
      )

      get :show, params: { id: step_code.id }

      expect(response).to have_http_status(:success)
      expect(json_response.dig("data", "checklist", "compliance_report")).to eq(
        report_hash
      )
      expect(StepCode::Part3::V1::GenerateReport).to have_received(:new).with(
        checklist: step_code.checklist
      )
    end

    it "returns forbidden for unauthorized user" do
      sign_in create(:user, :submitter)

      get :show, params: { id: step_code.id }

      expect(response).to have_http_status(:forbidden)
    end
  end
end
