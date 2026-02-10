require "rails_helper"

RSpec.describe "Api::Invitations", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:inviter) { create(:user, :review_manager) }
  let(:jurisdiction) { inviter.jurisdictions.first }

  describe "POST /api/invitation" do
    it "returns unauthorized when unauthenticated" do
      post "/api/invitation", params: { users: [] }

      expect(response).to have_http_status(:unauthorized)
    end

    it "returns invited users when invitations are created" do
      sign_in inviter
      invited_user = create(:user, confirmed: false)
      inviter_result =
        Struct.new(:results).new(
          {
            invited: [invited_user],
            reinvited: [],
            email_taken: [],
            failed: []
          }
        )
      inviter_double =
        instance_double(Jurisdiction::UserInviter, call: inviter_result)
      allow(Jurisdiction::UserInviter).to receive(:new).and_return(
        inviter_double
      )

      post "/api/invitation",
           params: {
             users: [
               {
                 email: "new-user@example.com",
                 role: "reviewer",
                 first_name: "New",
                 last_name: "User",
                 jurisdiction_id: jurisdiction.id
               }
             ]
           }

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "invited")).to be_present
    end

    it "returns an error when no invitations are created" do
      sign_in inviter
      inviter_result =
        Struct.new(:results).new(
          { invited: [], reinvited: [], email_taken: [], failed: [] }
        )
      inviter_double =
        instance_double(Jurisdiction::UserInviter, call: inviter_result)
      allow(Jurisdiction::UserInviter).to receive(:new).and_return(
        inviter_double
      )

      post "/api/invitation", params: { users: [{}] }

      expect(response).to have_http_status(:bad_request)
    end
  end

  describe "GET /api/invitations/:invitation_token" do
    it "returns invited user details with a valid token" do
      invited_user =
        User.invite!(
          {
            email: "invited-user@example.com",
            first_name: "Invited",
            last_name: "User",
            role: "submitter"
          },
          inviter
        )

      get "/api/invitations/#{invited_user.raw_invitation_token}"

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(invited_user.id)
    end

    it "returns not found for an invalid token" do
      get "/api/invitations/invalid-token"

      expect(response).to have_http_status(:not_found)
      expect(json_response.dig("error")).to eq("invalid_token")
    end
  end

  describe "PUT /api/invitation" do
    let(:token_encoder) do
      instance_double(Warden::JWTAuth::TokenEncoder, call: "stub-token")
    end
    let(:user_decoder) do
      instance_double(Warden::JWTAuth::UserDecoder, call: inviter)
    end

    before do
      allow(Warden::JWTAuth::TokenEncoder).to receive(:new).and_return(
        token_encoder
      )
      allow(Warden::JWTAuth::UserDecoder).to receive(:new).and_return(
        user_decoder
      )
      allow_any_instance_of(User).to receive(:on_jwt_dispatch)
      allow(JWT).to receive(:decode).and_return([{}, {}])
    end

    it "accepts a valid invitation token" do
      invited_user =
        User.invite!(
          {
            email: "accept-invite@example.com",
            first_name: "Accept",
            last_name: "Invite",
            role: "submitter"
          },
          inviter
        )

      put "/api/invitation",
          params: {
            user: {
              invitation_token: invited_user.raw_invitation_token,
              password: "P@ssword1",
              password_confirmation: "P@ssword1",
              first_name: "Accept",
              last_name: "Invite"
            }
          }

      expect(response).to have_http_status(:no_content)
      expect(invited_user.reload.invitation_accepted_at).to be_present
    end

    it "rejects an invalid invitation token" do
      put "/api/invitation",
          params: {
            user: {
              invitation_token: "invalid-token",
              password: "P@ssword1",
              password_confirmation: "P@ssword1",
              first_name: "Reject",
              last_name: "Invite"
            }
          }

      expect(response).to have_http_status(422)
    end
  end
end
