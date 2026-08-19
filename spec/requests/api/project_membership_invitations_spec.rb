require "rails_helper"

RSpec.describe "Api::ProjectMembershipInvitations", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:headers) { { "ACCEPT" => "application/json" } }
  let(:owner) { create(:user, :submitter) }
  let!(:permit_project) { create(:permit_project, owner: owner) }
  let(:invitee) { create(:user, :submitter, email: "invitee@example.com") }

  def create_pending_invite
    membership =
      create(
        :project_membership,
        :pending,
        permit_project: permit_project,
        invited_by: owner,
        invited_email: invitee.email
      )
    raw = membership.issue_invitation_token!
    [membership, raw]
  end

  describe "GET /api/project_membership_invitations/:token" do
    it "returns invitation context without attaching a user" do
      _membership, raw = create_pending_invite

      get "/api/project_membership_invitations/#{raw}", headers: headers

      expect(response).to have_http_status(:ok)
      data = json_response["data"]
      expect(data["invited_email"]).to eq(invitee.email)
      expect(data["project_title"]).to eq(permit_project.title)
      expect(data).not_to have_key("user")
    end

    it "returns not found for an unknown token" do
      get "/api/project_membership_invitations/not-a-token", headers: headers

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/project_membership_invitations/:token/accept" do
    it "accepts the invite for the signed-in user" do
      membership, raw = create_pending_invite
      sign_in invitee

      post "/api/project_membership_invitations/#{raw}/accept",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(membership.reload.user).to eq(invitee)
      expect(membership.accepted?).to be true
    end

    it "binds the signed-in user even when their email differs from the invite" do
      membership, raw = create_pending_invite
      other = create(:user, :submitter, email: "other@example.com")
      sign_in other

      post "/api/project_membership_invitations/#{raw}/accept",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(membership.reload.user).to eq(other)
    end

    it "requires authentication" do
      _membership, raw = create_pending_invite

      post "/api/project_membership_invitations/#{raw}/accept",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it "succeeds when the signed-in user already has access" do
      create(
        :project_membership,
        permit_project: permit_project,
        user: invitee,
        invited_email: invitee.email
      )
      membership =
        create(
          :project_membership,
          :pending,
          permit_project: permit_project,
          invited_by: owner,
          invited_email: "other-address@example.com"
        )
      raw = membership.issue_invitation_token!
      sign_in invitee

      post "/api/project_membership_invitations/#{raw}/accept",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(membership.reload.pending?).to be true
      expect(membership.user).to be_nil
    end

    it "succeeds when the signed-in user is the project owner" do
      membership, raw = create_pending_invite
      sign_in owner

      post "/api/project_membership_invitations/#{raw}/accept",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(membership.reload.pending?).to be true
    end
  end
end
