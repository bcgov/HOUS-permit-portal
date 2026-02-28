require "rails_helper"

RSpec.describe HomeController, type: :controller do
  describe "GET #index" do
    it "renders html for html requests" do
      get :index, format: :html
      expect(response).to have_http_status(:ok)
    end

    it "returns 404 for non-html formats" do
      get :index, format: :json
      expect(response).to have_http_status(:not_found)
    end
  end
end
