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

  let!(:membership) do
    record =
      create(
        :project_membership,
        user: member,
        permit_project: project,
        access: :full,
        contact_designation: :none
      )
    record.role_list = ["Architect"]
    record.save!
    record
  end

  before do
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

  describe "PATCH /api/permit_projects/:id/memberships/:id" do
    it "updates role tags and contact designation without changing access" do
      sign_in owner

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                role_tags: %w[Architect Builder],
                contact_designation: "alternate"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to include(
        "id" => membership.id,
        "contact_designation" => "alternate",
        "access" => "full"
      )
      expect(json_response["data"]["role_tags"]).to contain_exactly(
        "Architect",
        "Builder"
      )

      membership.reload
      expect(membership.role_list).to contain_exactly("Architect", "Builder")
      expect(membership.contact_designation).to eq("alternate")
      expect(membership.access).to eq("full")

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                contact_designation: "none"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(membership.reload.contact_designation).to eq("none")
    end

    it "updates project access" do
      sign_in owner

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                access: "standard"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to include("access" => "standard")
      expect(membership.reload.access).to eq("standard")
    end

    it "rejects an unknown access level" do
      sign_in owner

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                access: "admin"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(membership.reload.access).to eq("full")
    end

    it "lets the creator keep primary while updating roles" do
      creator_membership = project.project_memberships.find_by!(user: owner)
      sign_in owner

      patch "/api/permit_projects/#{project.id}/memberships/#{creator_membership.id}",
            params: {
              membership: {
                role_tags: ["Owner"],
                contact_designation: "primary"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(creator_membership.reload.contact_designation).to eq("primary")
      expect(creator_membership.role_list).to contain_exactly("Owner")
    end

    it "transfers primary contact to another member" do
      creator_membership = project.project_memberships.find_by!(user: owner)
      sign_in owner

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                contact_designation: "primary"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(membership.reload.contact_designation).to eq("primary")
      expect(creator_membership.reload.contact_designation).to eq("none")
    end

    it "rejects removing primary from the current primary contact" do
      creator_membership = project.project_memberships.find_by!(user: owner)
      sign_in owner

      patch "/api/permit_projects/#{project.id}/memberships/#{creator_membership.id}",
            params: {
              membership: {
                contact_designation: "alternate"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(creator_membership.reload.contact_designation).to eq("primary")
    end

    it "forbids a reviewer who can see the project" do
      sign_in create(:user, :reviewer, jurisdiction: jurisdiction)

      get "/api/permit_projects/#{project.id}/memberships", headers: headers
      expect(response).to have_http_status(:ok)

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                contact_designation: "alternate"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:forbidden)
      expect(membership.reload.contact_designation).to eq("none")
    end
  end

  describe "DELETE /api/permit_projects/:id/memberships/:id" do
    it "removes another member from the project" do
      sign_in owner

      delete "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
             headers: headers

      expect(response).to have_http_status(:ok)
      expect(ProjectMembership.exists?(membership.id)).to be(false)

      ProjectMembership.reindex

      get "/api/permit_projects/#{project.id}/memberships", headers: headers

      expect(response).to have_http_status(:ok)
      names = json_response["data"].map { |row| row["name"] }
      expect(names).to include("Olivia Owner")
      expect(names).not_to include("Mina Member")
    end

    it "forbids removing the creator membership" do
      creator_membership = project.project_memberships.find_by!(user: owner)
      sign_in owner

      delete "/api/permit_projects/#{project.id}/memberships/#{creator_membership.id}",
             headers: headers

      expect(response).to have_http_status(:forbidden)
      expect(ProjectMembership.exists?(creator_membership.id)).to be(true)
    end

    it "forbids a reviewer who can see the project" do
      sign_in create(:user, :reviewer, jurisdiction: jurisdiction)

      get "/api/permit_projects/#{project.id}/memberships", headers: headers
      expect(response).to have_http_status(:ok)

      delete "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
             headers: headers

      expect(response).to have_http_status(:forbidden)
      expect(ProjectMembership.exists?(membership.id)).to be(true)
    end
  end
end
