require "rails_helper"

RSpec.describe Api::ReportsController, type: :controller do
  let(:super_admin) { create(:user, :super_admin) }
  let(:submitter) { create(:user, :submitter) }

  describe "GET #index" do
    it "forbids anyone who is not a super admin" do
      sign_in submitter
      get :index, format: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "lists registered reports for a super admin" do
      sign_in super_admin
      get :index, format: :json

      expect(response).to have_http_status(:ok)
      keys = json_response["data"].map { |row| row["key"] }
      expect(keys).to include("application_growth")
    end
  end

  describe "GET #show" do
    it "forbids anyone who is not a super admin" do
      sign_in submitter
      get :show, params: { key: "application_growth" }, format: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "returns headline figures, a chart, and a table" do
      sign_in super_admin
      create(:permit_application)

      get :show,
          params: {
            key: "application_growth",
            range: "12_months"
          },
          format: :json

      expect(response).to have_http_status(:ok)
      data = json_response["data"]
      expect(data["headline_figures"]).to be_present
      expect(data["charts"]).to be_present
      expect(data["tables"]).to be_present
      expect(data).to have_key("empty")
    end

    it "returns not found for an unknown report" do
      sign_in super_admin
      get :show, params: { key: "not_a_report" }, format: :json

      expect(response).to have_http_status(:not_found)
    end

    it "applies the requested range to the payload" do
      sign_in super_admin
      get :show,
          params: {
            key: "application_growth",
            range: "3_months"
          },
          format: :json

      expect(json_response.dig("data", "range", "preset")).to eq("3_months")
    end
  end

  describe "POST #refresh" do
    it "forbids anyone who is not a super admin" do
      sign_in submitter
      post :refresh, params: { key: "application_growth" }, format: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "returns the previous payload when refresh fails" do
      sign_in super_admin
      previous = {
        "key" => "application_growth",
        "computed_at" => "2026-01-01T00:00:00Z",
        "headline_figures" => [],
        "charts" => [],
        "tables" => [],
        "empty" => true
      }
      allow(Reports::Cache).to receive(:fetch).and_return(
        previous.merge("refresh_failed" => true)
      )

      post :refresh,
           params: {
             key: "application_growth",
             range: "12_months"
           },
           format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "refresh_failed")).to eq(true)
      expect(json_response.dig("data", "computed_at")).to eq(
        "2026-01-01T00:00:00Z"
      )
      expect(json_response.dig("meta", "message", "type")).to eq("error")
    end
  end

  describe "GET #export" do
    it "forbids anyone who is not a super admin" do
      sign_in submitter
      get :export, params: { key: "application_growth" }, format: :csv

      expect(response).to have_http_status(:forbidden)
    end

    it "downloads a CSV whose filename identifies the report and range" do
      sign_in super_admin
      get :export,
          params: {
            key: "application_growth",
            range: "3_months"
          },
          format: :csv

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/csv")
      expect(response.headers["Content-Disposition"]).to include(
        "application_growth_3_months"
      )
      expect(response.body).to include("Month")
    end
  end
end
