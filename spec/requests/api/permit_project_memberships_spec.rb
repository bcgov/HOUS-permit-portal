require "rails_helper"

RSpec.describe "Api::PermitProjects::Memberships", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:headers) { { "ACCEPT" => "application/json" } }
  let(:owner) do
    create(:user, :submitter, first_name: "Olivia", last_name: "Owner")
  end
  let(:member) do
    create(:user, :submitter, first_name: "Mina", last_name: "Member")
  end
  let(:stranger) { create(:user, :submitter) }
  let(:jurisdiction) { create(:sub_district) }
  let(:project) do
    create(:permit_project, owner: owner, jurisdiction: jurisdiction)
  end
  let(:other_project) do
    create(:permit_project, owner: owner, jurisdiction: jurisdiction)
  end

  before do
    membership =
      create(
        :project_membership,
        user: member,
        permit_project: project,
        access: :full,
        contact_designation: :none
      )
    membership.role_list = ["Architect"]
    membership.save!

    create(
      :project_membership,
      permit_project: other_project,
      user: create(:user, :submitter, first_name: "Other", last_name: "Project")
    )
    User.reindex
    ProjectMembership.reindex
  end

  describe "GET /api/permit_projects/:id/memberships" do
    it "returns the creator membership and the other members" do
      sign_in owner

      get "/api/permit_projects/#{project.id}/memberships", headers: headers

      expect(response).to have_http_status(:ok)
      rows = json_response["data"]
      expect(rows.map { |row| row["kind"] }).to eq(%w[member member])
      expect(rows.map { |row| row["name"] }).to eq(
        ["Olivia Owner", "Mina Member"]
      )
      expect(rows.first).to include(
        "user_id" => owner.id,
        "access" => "full",
        "contact_designation" => "primary",
        "role_tags" => []
      )
      expect(rows.second).to include(
        "access" => "full",
        "contact_designation" => "none",
        "role_tags" => ["Architect"]
      )
      expect(rows.map { |row| row["name"] }).not_to include("Other Project")
    end

    it "denies a user who cannot show the project" do
      sign_in stranger

      get "/api/permit_projects/#{project.id}/memberships", headers: headers

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/permit_projects/:id/memberships/search" do
    it "matches a member name" do
      sign_in owner

      post "/api/permit_projects/#{project.id}/memberships/search",
           params: {
             query: "Mina"
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].map { |row| row["name"] }).to eq(
        ["Mina Member"]
      )
      expect(json_response["meta"]["role_tags"]).to eq(["Architect"])
    end

    it "matches the creator by name" do
      sign_in owner

      post "/api/permit_projects/#{project.id}/memberships/search",
           params: {
             query: "Olivia"
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].map { |row| row["name"] }).to eq(
        ["Olivia Owner"]
      )
      expect(json_response["data"].first).to include(
        "kind" => "member",
        "access" => "full",
        "contact_designation" => "primary"
      )
    end

    it "filters by access" do
      sign_in owner

      post "/api/permit_projects/#{project.id}/memberships/search",
           params: {
             filters: {
               access: ["full"]
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].map { |row| row["name"] }).to eq(
        ["Olivia Owner", "Mina Member"]
      )
    end
  end
end
