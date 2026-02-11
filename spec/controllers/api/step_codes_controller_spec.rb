require "rails_helper"

RSpec.describe Api::StepCodesController, type: :controller do
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
  let(:step_code) do
    create(
      :part_3_step_code,
      permit_application: permit_application,
      creator: submitter
    )
  end

  before do
    sign_in submitter
    request.headers["ACCEPT"] = "application/json"
    allow(StepCode.search_index).to receive(:refresh)
  end

  describe "PATCH #update" do
    it "updates the step code for the creator" do
      standalone_step_code =
        create(
          :part_3_step_code,
          permit_application: nil,
          creator: submitter,
          title: "Old Title"
        )

      patch :update,
            params: {
              id: standalone_step_code.id,
              step_code: {
                title: "Updated Title"
              }
            },
            as: :json

      expect(response).to have_http_status(:success)
      expect(json_response.dig("data", "title")).to eq("Updated Title")
    end

    it "rejects updates to archived step codes" do
      step_code.update!(discarded_at: Time.current)

      patch :update,
            params: {
              id: step_code.id,
              step_code: {
                title: "Archived"
              }
            },
            as: :json

      expect(response).to have_http_status(422)
      expect(json_response.dig("meta", "message", "message")).to eq(
        "Cannot update archived step code. Please restore it first."
      )
    end

    it "returns forbidden when reassigning to another submitter's permit application" do
      other_submitter = create(:user, :submitter)
      other_permit_application =
        create(
          :permit_application,
          submitter: other_submitter,
          jurisdiction: jurisdiction
        )

      patch :update,
            params: {
              id: step_code.id,
              step_code: {
                permit_application_id: other_permit_application.id
              }
            },
            as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "returns error for invalid input" do
      allow(StepCode).to receive(:find).and_return(step_code)
      allow(step_code).to receive(:update!).and_raise(
        ActiveRecord::RecordInvalid.new(
          StepCode.new.tap { |record| record.errors.add(:base, "invalid") }
        )
      )

      patch :update,
            params: {
              id: step_code.id,
              step_code: {
                title: "Bad"
              }
            },
            as: :json

      expect(response).to have_http_status(400)
      expect(json_response.dig("meta", "message", "message")).to include(
        "invalid"
      )
    end
  end

  describe "DELETE #destroy" do
    it "discards the step code" do
      delete :destroy, params: { id: step_code.id }

      expect(response).to have_http_status(:success)
      expect(json_response.dig("data", "id")).to eq(step_code.id)
    end

    it "returns forbidden for unauthorized user" do
      sign_in create(:user, :submitter)

      delete :destroy, params: { id: step_code.id }

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH #restore" do
    it "restores a discarded step code" do
      step_code.update!(discarded_at: Time.current)

      patch :restore, params: { id: step_code.id }

      expect(response).to have_http_status(:success)
      expect(json_response.dig("data", "id")).to eq(step_code.id)
    end
  end

  describe "GET #download_step_code_summary_csv" do
    it "returns csv data for super admins" do
      sign_in create(:user, :super_admin)
      service = instance_double(StepCodeExportService, summary_csv: "csv-data")
      allow(StepCodeExportService).to receive(:new).and_return(service)

      get :download_step_code_summary_csv

      expect(response).to have_http_status(:success)
      expect(response.body).to eq("csv-data")
    end

    it "returns forbidden for non-admins" do
      get :download_step_code_summary_csv

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "GET #download_step_code_metrics_csv" do
    it "returns part 3 metrics for super admins" do
      sign_in create(:user, :super_admin)
      service =
        instance_double(StepCodeExportService, part_3_metrics_csv: "p3-csv")
      allow(StepCodeExportService).to receive(:new).and_return(service)

      get :download_step_code_metrics_csv,
          params: {
            step_code_type: "Part3StepCode"
          }

      expect(response).to have_http_status(:success)
      expect(response.body).to eq("p3-csv")
    end

    it "returns bad request for invalid step code type" do
      sign_in create(:user, :super_admin)

      expect {
        get :download_step_code_metrics_csv,
            params: {
              step_code_type: "Invalid"
            }
      }.to raise_error(ActionController::BadRequest, "Invalid step code type")
    end
  end
end
