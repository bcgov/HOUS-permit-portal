# spec/controllers/api/users_controller_spec.rb
require "rails_helper"

RSpec.describe Api::UsersController, type: :controller do
  # Define users with different roles
  let(:super_admin) { create(:user, :super_admin) }
  let(:submitter) { create(:user, :submitter) }

  # Helper method to parse JSON responses
  def json_response
    JSON.parse(response.body)
  end

  def profile_params(user, params)
    {
      user: {
        first_name: params[:first_name] || user.first_name,
        last_name: params[:last_name] || user.last_name,
        certified: params[:certified] || user.certified,
        department: params[:department] || user.department
      }
    }
  end

  describe "GET #super_admins" do
    before do
      # Assuming you're using Devise for authentication
      sign_in super_admin
    end

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

  describe "login with Review manager" do
    let(:jurisdiction) { create(:sub_district) }
    let!(:review_manager) do
      create(:user, :review_manager, jurisdiction: jurisdiction)
    end

    before { sign_in review_manager }

    context "when we try to update the department" do
      it "department should be updated in DB " do
        patch :profile,
              params:
                profile_params(review_manager, { department: "Department" })
        expect(review_manager.reload.department).to eq "Department"
      end

      it "department should come in the response" do
        patch :profile,
              params:
                profile_params(review_manager, { department: "Department1" })
        expect(json_response.dig("data", "department")).to eq "Department1"
      end
    end
  end
end
