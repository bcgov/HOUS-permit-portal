require "rails_helper"

RSpec.describe "Api::PermitApplications", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:headers) { { "ACCEPT" => "application/json" } }
  let(:submitter) { create(:user, :submitter) }
  let(:other_user) { create(:user, :submitter) }
  let(:jurisdiction) { create(:sub_district) }
  let(:requirement_template) do
    create(:live_requirement_template_with_sections)
  end
  let(:template_version) do
    create(
      :template_version,
      requirement_template: requirement_template,
      form_json: requirement_template.to_form_json,
      status: "published"
    )
  end
  let(:permit_application) do
    create(
      :permit_application,
      submitter: submitter,
      template_version: template_version,
      jurisdiction: jurisdiction
    )
  end
  let(:permit_project) { permit_application.permit_project }

  before do
    sign_in submitter
    allow(TemplateVersion).to receive(:cached_published_ids).and_return(
      [template_version.id]
    )
    allow(SiteConfiguration).to receive(:inbox_enabled?).and_return(true)
  end

  def cached_file_data
    file = File.open("spec/support/signed_converted.pdf", binmode: true)
    uploaded_file = Shrine.upload(file, :cache, metadata: false)
    uploaded_file.metadata.merge!(
      "size" => File.size(file.path),
      "mime_type" => "application/pdf",
      "filename" => "test.pdf"
    )
    uploaded_file.data
  ensure
    file&.close
  end

  describe "POST /api/permit_applications" do
    let(:valid_params) do
      {
        permit_application: {
          activity_id: permit_application.activity_id,
          permit_type_id: permit_application.permit_type_id,
          jurisdiction_id: permit_project.jurisdiction_id,
          permit_project_id: permit_project.id,
          full_address: "123 Main St"
        }
      }
    end

    it "creates a permit application for the current submitter" do
      post "/api/permit_applications",
           params: valid_params,
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response).to include("data", "meta")
      expect(json_response.dig("data", "submitter", "id")).to eq(submitter.id)
    end

    it "ignores submitter_id injection" do
      params =
        valid_params.deep_merge(
          permit_application: {
            submitter_id: other_user.id
          }
        )

      post "/api/permit_applications",
           params: params,
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(PermitApplication.last.submitter_id).to eq(submitter.id)
    end

    it "returns validation errors for invalid payloads" do
      allow_any_instance_of(PermitApplication).to receive(:save) do |record|
        record.errors.add(:base, "invalid")
        false
      end

      post "/api/permit_applications",
           params: {
             permit_application: {
               activity_id: permit_application.activity_id,
               permit_type_id: permit_application.permit_type_id,
               jurisdiction_id: permit_project.jurisdiction_id,
               permit_project_id: permit_project.id
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:bad_request)
      expect(json_response.dig("meta", "message", "message")).to be_present
    end
  end

  describe "GET /api/permit_applications/:id" do
    it "returns the permit application for the submitter" do
      get "/api/permit_applications/#{permit_application.id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(permit_application.id)
    end

    it "forbids access for unrelated users" do
      sign_in other_user

      get "/api/permit_applications/#{permit_application.id}", headers: headers

      expect(response).to have_http_status(:forbidden)
      expect(json_response.dig("meta", "message", "message")).to be_present
    end
  end

  describe "PATCH /api/permit_applications/:id" do
    it "updates a draft permit application" do
      patch "/api/permit_applications/#{permit_application.id}",
            params: {
              permit_application: {
                nickname: "Updated Draft"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "nickname")).to eq("Updated Draft")
    end

    it "does not allow submitter_id updates" do
      patch "/api/permit_applications/#{permit_application.id}",
            params: {
              permit_application: {
                submitter_id: other_user.id
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(permit_application.reload.submitter_id).to eq(submitter.id)
    end

    it "returns forbidden for non-collaborators" do
      sign_in other_user

      patch "/api/permit_applications/#{permit_application.id}",
            params: {
              permit_application: {
                nickname: "Nope"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/permit_applications/:id/submit" do
    it "submits the permit application" do
      post "/api/permit_applications/#{permit_application.id}/submit",
           params: {
             permit_application: {
               submission_data: {
                 data: {
                   "section-completion-key" => {
                     signed: true
                   }
                 }
               }
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response).to include("data", "meta")
    end
  end

  describe "POST /api/permit_applications/:id/mark_as_viewed" do
    let(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }
    let(:submitted_application) do
      create(
        :permit_application,
        :newly_submitted,
        submitter: submitter,
        template_version: template_version,
        jurisdiction: jurisdiction
      )
    end

    it "marks the application as viewed for review staff" do
      sign_in reviewer

      post "/api/permit_applications/#{submitted_application.id}/mark_as_viewed",
           headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(submitted_application.id)
    end
  end

  describe "PATCH /api/permit_applications/:id/revision_requests" do
    let(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }
    let(:submitted_application) do
      create(
        :permit_application,
        :newly_submitted,
        submitter: submitter,
        template_version: template_version,
        jurisdiction: jurisdiction
      )
    end

    it "updates revision requests for review staff" do
      sign_in reviewer

      patch "/api/permit_applications/#{submitted_application.id}/revision_requests",
            params: {
              submission_version: {
                revision_requests_attributes: []
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(submitted_application.id)
    end
  end

  describe "PATCH /api/permit_applications/:id/update_version" do
    it "updates the template version for drafts" do
      allow(TemplateVersioningService).to receive(
        :update_draft_permit_with_new_template_version
      ).and_return(true)

      patch "/api/permit_applications/#{permit_application.id}/update_version",
            headers: headers

      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /api/permit_applications/:id/revision_requests/finalize" do
    let(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }
    let(:submitted_application) do
      create(
        :permit_application,
        :newly_submitted,
        submitter: submitter,
        template_version: template_version,
        jurisdiction: jurisdiction
      )
    end

    it "finalizes revision requests for review staff" do
      sign_in reviewer
      allow_any_instance_of(PermitApplication).to receive(
        :finalize_revision_requests!
      ).and_return(true)

      post "/api/permit_applications/#{submitted_application.id}/revision_requests/finalize",
           headers: headers

      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /api/permit_applications/:id/permit_block_status" do
    it "creates or updates permit block status" do
      allow(WebsocketBroadcaster).to receive(:push_update_to_relevant_users)
      allow(NotificationService).to receive(
        :publish_permit_block_status_ready_event
      )

      post "/api/permit_applications/#{permit_application.id}/permit_block_status",
           params: {
             requirement_block_id: TestConstants::REQUIREMENT_BLOCK_IDS.first,
             collaboration_type: "submission",
             status: "ready"
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "status")).to eq("ready")
    end
  end

  describe "GET /api/permit_applications/download_application_metrics_csv" do
    let(:super_admin) { create(:user, :super_admin) }

    it "returns csv data for super admins" do
      sign_in super_admin
      allow(PermitApplicationExportService).to receive_message_chain(
        :new,
        :application_metrics_csv
      ).and_return("csv-data")

      get "/api/permit_applications/download_application_metrics_csv",
          headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.content_type).to include("text/csv")
    end
  end

  describe "POST /api/permit_applications/:id/retrigger_submission_webhook" do
    let(:reviewer) do
      create(:user, :review_manager, jurisdiction: jurisdiction)
    end
    let(:submitted_application) do
      create(
        :permit_application,
        :newly_submitted,
        submitter: submitter,
        template_version: template_version,
        jurisdiction: jurisdiction
      )
    end

    it "retries the submission webhook for review staff" do
      sign_in reviewer
      allow_any_instance_of(PermitApplication).to receive(
        :send_submitted_webhook
      )

      post "/api/permit_applications/#{submitted_application.id}/retrigger_submission_webhook",
           headers: headers

      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /api/permit_applications/:id/permit_collaborations/invite" do
    it "invites a new collaborator" do
      collaborator = create(:collaborator, collaboratorable: submitter)
      permit_collaboration =
        create(
          :permit_collaboration,
          permit_application: permit_application,
          collaborator: collaborator
        )
      service =
        instance_double(PermitCollaboration::CollaborationManagementService)

      allow(PermitCollaboration::CollaborationManagementService).to receive(
        :new
      ).and_return(service)
      allow(service).to receive(
        :invite_new_submission_collaborator!
      ) do |**kwargs|
        kwargs[:authorize_collaboration]&.call(permit_collaboration)
        permit_collaboration
      end

      post "/api/permit_applications/#{permit_application.id}/permit_collaborations/invite",
           params: {
             collaborator_invite: {
               collaborator_type: "delegatee",
               user: {
                 email: "invitee@example.com",
                 first_name: "New",
                 last_name: "User"
               }
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(permit_collaboration.id)
    end
  end

  describe "PATCH /api/permit_applications/:id/upload_supporting_document" do
    it "uploads supporting documents and enqueues promotion" do
      allow(PromoteJob).to receive(:perform_async)
      allow(VirusScanService).to receive(:new).and_return(
        instance_double(VirusScanService, scan!: true)
      )

      patch "/api/permit_applications/#{permit_application.id}/upload_supporting_document",
            params: {
              permit_application: {
                supporting_documents_attributes: [
                  { data_key: "RB123", file: cached_file_data }
                ]
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to be_an(Array)
      expect(PromoteJob).to have_received(:perform_async)
    end
  end

  describe "POST /api/permit_applications/:id/permit_collaborations" do
    it "creates a permit collaboration via the service" do
      collaborator = create(:collaborator, collaboratorable: submitter)
      permit_collaboration =
        create(
          :permit_collaboration,
          permit_application: permit_application,
          collaborator: collaborator
        )
      service =
        instance_double(PermitCollaboration::CollaborationManagementService)

      allow(PermitCollaboration::CollaborationManagementService).to receive(
        :new
      ).and_return(service)
      allow(service).to receive(:assign_collaborator!) do |**kwargs|
        kwargs[:authorize_collaboration]&.call(permit_collaboration)
        permit_collaboration
      end

      post "/api/permit_applications/#{permit_application.id}/permit_collaborations",
           params: {
             permit_collaboration: {
               collaborator_id: collaborator.id,
               collaborator_type: "delegatee"
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(permit_collaboration.id)
    end
  end

  describe "DELETE /api/permit_applications/:id/permit_collaborations/remove_collaborator_collaborations" do
    it "removes collaborator collaborations" do
      collaborator = create(:collaborator, collaboratorable: submitter)
      permit_collaboration =
        create(
          :permit_collaboration,
          permit_application: permit_application,
          collaborator: collaborator
        )

      delete "/api/permit_applications/#{permit_application.id}/permit_collaborations/remove_collaborator_collaborations",
             params: {
               collaborator_id: collaborator.id,
               collaborator_type: permit_collaboration.collaborator_type,
               collaboration_type: permit_collaboration.collaboration_type
             },
             headers: headers,
             as: :json

      expect(response).to have_http_status(:ok)
      expect(PermitCollaboration.exists?(permit_collaboration.id)).to be(false)
    end
  end

  describe "POST /api/permit_applications/:id/generate_missing_pdfs" do
    it "enqueues zipfile generation" do
      allow(ZipfileJob).to receive(:perform_async)

      post "/api/permit_applications/#{permit_application.id}/generate_missing_pdfs",
           headers: headers

      expect(response).to have_http_status(:ok)
      expect(ZipfileJob).to have_received(:perform_async).with(
        permit_application.id
      )
    end
  end
end
