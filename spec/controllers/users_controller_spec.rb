# spec/controllers/api/users_controller_spec.rb
require "rails_helper"

RSpec.describe Api::UsersController, type: :controller do
  # Define users with different roles
  let(:super_admin) { create(:user, :super_admin) }
  let(:submitter) { create(:user, :submitter) }

  before do
    # Assuming you're using Devise for authentication
    sign_in super_admin
  end

  # Helper method to parse JSON responses
  def json_response
    JSON.parse(response.body)
  end

  describe "GET #super_admins" do
    let!(:super_admins) { create_list(:user, 3, :super_admin) }

    context "when the user is authorized" do
      it "returns the list of super admins" do
        get :super_admins

        expect(response).to have_http_status(:success)
        expect(json_response["data"].length).to eq(4)
        expect(json_response["data"].first["omniauth_email"]).to be_nil
      end
    end

    context "when an error occurs in the service" do
      before do
        allow(User).to receive(:super_admin).and_raise(
          StandardError.new("Service Error")
        )
      end

      it "returns an internal server error response" do
        get :super_admins

        expect(response).to have_http_status(:bad_request)
        expect(json_response["meta"]["message"]["message"]).to include(
          "Could not fetch super users"
        )
      end
    end

    context "when the user is unauthorized" do
      before { sign_in submitter }

      it "returns a forbidden error" do
        get :super_admins

        expect(response).to have_http_status(:forbidden)
        expect(json_response["meta"]["message"]["message"]).to include(
          "The user is not authorized to do this action"
        )
      end
    end
  end
end
