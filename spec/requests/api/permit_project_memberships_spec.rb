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
        contact_designation: :primary
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
    it "returns this project's owner and members" do
      sign_in member

      get "/api/permit_projects/#{project.id}/memberships", headers: headers

      expect(response).to have_http_status(:ok)
      rows = json_response["data"]
      expect(rows.map { |row| row["kind"] }).to eq(%w[owner member])
      expect(rows.map { |row| row["name"] }).to eq(
        ["Olivia Owner", "Mina Member"]
      )
      expect(rows.first["access"]).to be_nil
      expect(rows.second).to include(
        "access" => "full",
        "contact_designation" => "primary",
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
    it "matches a member name and leaves the owner out" do
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

    it "matches the owner by name" do
      sign_in owner

      post "/api/permit_projects/#{project.id}/memberships/search",
           params: {
             query: "Olivia"
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].map { |row| row["kind"] }).to eq(["owner"])
    end

    it "filters by access and skips the owner" do
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
        ["Mina Member"]
      )
    end
  end
end
