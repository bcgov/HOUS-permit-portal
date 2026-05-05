# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::ProjectAudits (project activities)", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:headers) { { "ACCEPT" => "application/json" } }
  let(:owner) { create(:user, :submitter) }
  let(:other_user) { create(:user, :submitter) }
  let(:jurisdiction) { create(:sub_district) }
  let!(:permit_project) do
    create(:permit_project, owner: owner, jurisdiction: jurisdiction)
  end

  before { sign_in owner }

  describe "POST /api/permit_projects/:id/activities" do
    it "returns success for project owner" do
      post "/api/permit_projects/#{permit_project.id}/activities",
           params: {
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response).to include("data", "meta")
      expect(json_response["data"]).to be_an(Array)
      expect(json_response["meta"]).to include(
        "total_pages",
        "total_count",
        "current_page",
        "per_page"
      )
    end

    it "returns success for project collaborator" do
      permit_application =
        create(
          :permit_application,
          permit_project: permit_project,
          submitter: owner,
          jurisdiction: jurisdiction
        )
      collaborator =
        create(:collaborator, user: other_user, collaboratorable: owner)
      create(
        :permit_collaboration,
        permit_application: permit_application,
        collaborator: collaborator,
        collaboration_type: :submission
      )
      sign_in other_user

      post "/api/permit_projects/#{permit_project.id}/activities",
           params: {
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response).to include("data", "meta")
    end

    it "returns forbidden for user with no access to the project" do
      sign_in other_user

      post "/api/permit_projects/#{permit_project.id}/activities",
           params: {
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "returns not found for non-existent project" do
      post "/api/permit_projects/#{SecureRandom.uuid}/activities",
           params: {
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:not_found)
    end

    it "returns unauthorized when unauthenticated" do
      sign_out owner

      post "/api/permit_projects/#{permit_project.id}/activities",
           params: {
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    context "when project has activity" do
      before do
        create(
          :permit_application,
          permit_project: permit_project,
          submitter: owner,
          jurisdiction: jurisdiction
        )
      end

      it "returns activities with description, timestamp, and optional permit link fields" do
        post "/api/permit_projects/#{permit_project.id}/activities",
             params: {
             },
             headers: headers,
             as: :json

        expect(response).to have_http_status(:ok)
        data = json_response["data"]
        expect(data).not_to be_empty
        first_activity = data.first
        expect(first_activity).to include("id", "description", "created_at")
        expect(first_activity).to have_key("permit_application_id")
        expect(first_activity).to have_key("permit_name")
      end

      it "respects pagination with page and per_page" do
        post "/api/permit_projects/#{permit_project.id}/activities",
             params: {
               page: 1,
               per_page: 2
             },
             headers: headers,
             as: :json

        expect(response).to have_http_status(:ok)
        expect(json_response["data"].size).to be <= 2
        expect(json_response.dig("meta", "per_page")).to eq(2)
        expect(json_response.dig("meta", "current_page")).to eq(1)
        expect(json_response.dig("meta", "total_pages")).to be >= 1
        expect(json_response.dig("meta", "total_count")).to be >= 0
      end

      it "orders activities by most recent first by default" do
        post "/api/permit_projects/#{permit_project.id}/activities",
             params: {
             },
             headers: headers,
             as: :json

        expect(response).to have_http_status(:ok)
        data = json_response["data"]
        next if data.size < 2

        timestamps =
          data.map do |activity|
            created_at = activity["created_at"]
            # Handle either string or numeric timestamp values
            if created_at.is_a?(String)
              Time.zone.parse(created_at)
            else
              Time.zone.at(created_at.to_f)
            end
          end
        expect(timestamps).to eq(timestamps.sort.reverse)
      end

      it "supports sort direction ascending (least recent first)" do
        post "/api/permit_projects/#{permit_project.id}/activities",
             params: {
               sort: {
                 field: "created_at",
                 direction: "asc"
               }
             },
             headers: headers,
             as: :json

        expect(response).to have_http_status(:ok)
        data = json_response["data"]
        next if data.size < 2

        timestamps =
          data.map do |activity|
            created_at = activity["created_at"]
            if created_at.is_a?(String)
              Time.zone.parse(created_at)
            else
              Time.zone.at(created_at.to_f)
            end
          end
        expect(timestamps).to eq(timestamps.sort)
      end

      it "includes activities on a calendar day when from and to are the same date" do
        create(
          :permit_application,
          permit_project: permit_project,
          submitter: owner,
          jurisdiction: jurisdiction
        )
        audit =
          ApplicationAudit
            .for_permit_project(permit_project.id)
            .order(:id)
            .first
        audit.update_column(:created_at, Time.zone.parse("2026-04-29 14:30:00"))

        post "/api/permit_projects/#{permit_project.id}/activities",
             params: {
               filters: {
                 from: "2026/04/29",
                 to: "2026/04/29"
               }
             },
             headers: headers,
             as: :json

        expect(response).to have_http_status(:ok)
        ids = json_response["data"].map { |row| row["id"] }
        expect(ids).to include(audit.id)
      end
    end

    context "with sandbox scoping" do
      let(:review_manager) do
        create(:user, :review_manager, jurisdiction: jurisdiction)
      end
      # Jurisdictions auto-create :published and :scheduled sandboxes on create
      let(:sandbox) { jurisdiction.sandboxes.published.first }
      let!(:sandboxed_project) do
        create(
          :permit_project,
          owner: review_manager,
          jurisdiction: jurisdiction,
          sandbox: sandbox
        )
      end

      before { sign_in review_manager }

      it "returns 404 when the staff user's sandbox does not match the project's sandbox" do
        post "/api/permit_projects/#{sandboxed_project.id}/activities",
             params: {
             },
             headers: headers,
             as: :json

        expect(response).to have_http_status(:not_found)
      end

      it "returns 200 when the staff user's sandbox matches the project's sandbox" do
        post "/api/permit_projects/#{sandboxed_project.id}/activities",
             params: {
             },
             headers: headers.merge("X-Sandbox-ID" => sandbox.id),
             as: :json

        expect(response).to have_http_status(:ok)
      end
    end

    context "when project has no audits" do
      it "returns empty array and meta with zero counts" do
        empty_project =
          create(:permit_project, owner: owner, jurisdiction: jurisdiction)
        ApplicationAudit.where(
          auditable_type: "PermitProject",
          auditable_id: empty_project.id
        ).delete_all

        post "/api/permit_projects/#{empty_project.id}/activities",
             params: {
             },
             headers: headers,
             as: :json

        expect(response).to have_http_status(:ok)
        expect(json_response["data"]).to eq([])
        expect(json_response.dig("meta", "total_count")).to eq(0)
        expect(json_response.dig("meta", "total_pages")).to eq(0)
      end
    end
  end
end
