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
  end
end
