# frozen_string_literal: true

require "rails_helper"

RSpec.describe Api::Print::StepCodeChecklistsController, type: :controller do
  describe "GET #show" do
    it "rejects missing tokens" do
      get :show
      expect(response).to have_http_status(:unauthorized)
    end

    it "rejects invalid tokens" do
      get :show, params: { print_token: "not-valid" }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
