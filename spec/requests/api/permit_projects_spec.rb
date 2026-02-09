require "rails_helper"

RSpec.describe "Api::PermitProjects", type: :request, search: true do
  include Devise::Test::IntegrationHelpers

  let(:headers) { { "ACCEPT" => "application/json" } }
  let(:owner) { create(:user, :submitter) }
  let(:other_user) { create(:user, :submitter) }
  let(:jurisdiction) { create(:sub_district) }
  let!(:permit_project) do
    create(:permit_project, owner: owner, jurisdiction: jurisdiction)
  end

  before do
    sign_in owner
    PermitProject.reindex
  end

  describe "POST /api/permit_projects/search" do
    it "returns paginated results for the owner" do
      create_list(:permit_project, 3, owner: owner)
      PermitProject.reindex

      post "/api/permit_projects/search",
           params: {
             page: 1,
             per_page: 2
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response).to include("data", "meta")
      expect(json_response["data"].size).to eq(2)
      expect(json_response.dig("meta", "total_pages")).to be_present
    end

    it "filters out projects for unrelated users" do
      other_projects = create_list(:permit_project, 2, owner: other_user)
      PermitProject.reindex

      post "/api/permit_projects/search", headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      returned_ids = json_response["data"].map { |proj| proj["id"] }
      expect(returned_ids).to include(permit_project.id)
      expect(returned_ids).not_to include(*other_projects.map(&:id))
    end
  end

  describe "POST /api/permit_projects" do
    it "creates a permit project for the current user" do
      post "/api/permit_projects",
           params: {
             permit_project: {
               title: "Project Alpha",
               jurisdiction_id: permit_project.jurisdiction_id,
               owner_id: other_user.id
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:created)
      expect(json_response.dig("data", "owner_id")).to eq(owner.id)
    end

    it "returns validation errors for invalid payloads" do
      allow(ArbitraryMessageConstruct).to receive(:message).and_return(
        { message: "error" }
      )

      post "/api/permit_projects",
           params: {
             permit_project: {
               title: nil,
               jurisdiction_id: permit_project.jurisdiction_id
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(422)
      expect(json_response.dig("meta", "message", "message")).to be_present
    end
  end

  describe "PATCH /api/permit_projects/:id" do
    it "updates a project for the owner" do
      patch "/api/permit_projects/#{permit_project.id}",
            params: {
              permit_project: {
                title: "New Title"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "title")).to eq("New Title")
    end

    it "forbids non-owners" do
      sign_in other_user

      patch "/api/permit_projects/#{permit_project.id}",
            params: {
              permit_project: {
                title: "Nope"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "GET /api/permit_projects/:id" do
    it "returns the project for the owner" do
      get "/api/permit_projects/#{permit_project.id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(permit_project.id)
    end
  end

  describe "GET /api/permit_projects/pinned" do
    it "returns pinned projects for the user" do
      owner.pinned_projects.create(permit_project: permit_project)

      get "/api/permit_projects/pinned", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].map { |p| p["id"] }).to include(
        permit_project.id
      )
    end
  end

  describe "POST /api/permit_projects/:id/pin" do
    it "pins the project for the user" do
      post "/api/permit_projects/#{permit_project.id}/pin", headers: headers

      expect(response).to have_http_status(:ok)
      expect(owner.pinned_projects.reload.count).to eq(1)
    end
  end

  describe "DELETE /api/permit_projects/:id/unpin" do
    it "unpins the project for the user" do
      owner.pinned_projects.create(permit_project: permit_project)

      delete "/api/permit_projects/#{permit_project.id}/unpin", headers: headers

      expect(response).to have_http_status(:ok)
      expect(owner.pinned_projects.reload.count).to eq(0)
    end
  end

  describe "GET /api/permit_projects/:id/submission_collaborator_options" do
    it "returns submission collaborator options" do
      allow_any_instance_of(PermitProject).to receive(
        :submission_collaborators
      ).and_return([])

      get "/api/permit_projects/#{permit_project.id}/submission_collaborator_options",
          headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to eq([])
    end
  end

  describe "GET /api/permit_projects/jurisdiction_options" do
    it "returns jurisdiction options" do
      get "/api/permit_projects/jurisdiction_options", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).not_to be_empty
      expect(json_response["data"].first).to include("label", "value")
    end
  end

  describe "POST /api/permit_projects/:id/permit_applications/search" do
    let(:permit_type) { create(:permit_type) }
    let(:activity) { create(:activity) }

    it "returns permit applications for a project" do
      create(
        :permit_type_submission_contact,
        jurisdiction: permit_project.jurisdiction,
        permit_type: permit_type
      )
      create(
        :permit_application,
        permit_project: permit_project,
        submitter: owner,
        permit_type: permit_type,
        activity: activity
      )
      PermitApplication.reindex

      post "/api/permit_projects/#{permit_project.id}/permit_applications/search",
           params: {
             page: 1,
             per_page: 1
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response).to include("data", "meta")
    end
  end

  describe "POST /api/permit_projects/:id/permit_applications" do
    let(:requirement_template) do
      create(:live_requirement_template_with_sections)
    end
    let!(:template_version) do
      create(
        :template_version,
        requirement_template: requirement_template,
        form_json: requirement_template.to_form_json,
        status: "published"
      )
    end
    let(:permit_type) { requirement_template.permit_type }
    let(:activity) { requirement_template.activity }

    it "bulk creates permit applications for a project" do
      post "/api/permit_projects/#{permit_project.id}/permit_applications",
           params: {
             permit_applications: [
               {
                 activity_id: activity.id,
                 permit_type_id: permit_type.id,
                 jurisdiction_id: permit_project.jurisdiction_id,
                 first_nations: false
               }
             ]
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response).to include("data", "meta")
      expect(json_response["data"].size).to eq(1)
    end

    it "returns errors when any payload is invalid" do
      allow_any_instance_of(PermitApplication).to receive(
        :assign_default_nickname
      )

      post "/api/permit_projects/#{permit_project.id}/permit_applications",
           params: {
             permit_applications: [
               {
                 activity_id: activity.id,
                 permit_type_id: permit_type.id,
                 jurisdiction_id: permit_project.jurisdiction_id
               }
             ]
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:bad_request)
      expect(json_response.dig("meta", "message", "message")).to be_present
    end
  end
end
