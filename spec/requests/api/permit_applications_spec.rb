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

    it "forbids review staff from opening a new draft" do
      sign_in create(:user, :reviewer, jurisdiction: jurisdiction)

      get "/api/permit_applications/#{permit_application.id}", headers: headers

      expect(response).to have_http_status(:forbidden)
    end

    it "lets review staff open a new draft when the project has an active meeting" do
      sign_in create(:user, :reviewer, jurisdiction: jurisdiction)
      create(:project_meeting, :open, permit_project: permit_project)

      get "/api/permit_applications/#{permit_application.id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(permit_application.id)
    end

    it "returns active project meeting metadata for the submitter" do
      active_meeting =
        create(:project_meeting, :open, permit_project: permit_project)

      get "/api/permit_applications/#{permit_application.id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "has_active_project_meeting")).to be(
        true
      )
      expect(json_response.dig("data", "active_project_meeting_id")).to eq(
        active_meeting.id
      )
    end
  end

  describe "GET /api/permit_applications/:id/download_application_json" do
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

    it "returns external API JSON for review staff" do
      sign_in reviewer

      get "/api/permit_applications/#{submitted_application.id}/download_application_json",
          headers: headers

      body = JSON.parse(response.body)

      expect(response).to have_http_status(:ok)
      expect(response.content_type).to include("application/json")
      expected_filename =
        PermitApplicationGeneratedFileNamer.new(
          submitted_application
        ).permit_application_json
      expect(response.headers["Content-Disposition"]).to include(
        expected_filename
      )
      expect(body["id"]).to eq(submitted_application.id)
      expect(body).to include("submission_data")
    end

    it "forbids submitters from downloading reviewer JSON" do
      get "/api/permit_applications/#{submitted_application.id}/download_application_json",
          headers: headers

      expect(response).to have_http_status(:forbidden)
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

    it "updates step_code_stage" do
      patch "/api/permit_applications/#{permit_application.id}",
            params: {
              permit_application: {
                step_code_stage: "as_built"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "step_code_stage")).to eq("as_built")
      expect(permit_application.reload.step_code_stage).to eq("as_built")
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

    it "submits when the permit type advises a project meeting" do
      create(
        :jurisdiction_template_version_customization,
        jurisdiction: jurisdiction,
        template_version: template_version,
        requires_project_meeting: true
      )

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
      expect(json_response.dig("data", "requires_project_meeting")).to be(true)
    end

    it "keeps the submitter note on the version that had the requests" do
      revision_application =
        create(
          :permit_application,
          :revisions_requested,
          submitter: submitter,
          template_version: template_version,
          jurisdiction: jurisdiction,
          submission_data: {
            "data" => {
              "section-completion-key" => {
                "signed" => true
              }
            }
          }
        )
      requested_version = revision_application.latest_submission_version

      patch "/api/permit_applications/#{revision_application.id}/submitter_note",
            params: {
              permit_application: {
                submitter_note:
                  "I will submit the demolition application next week."
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(requested_version.reload.submitter_note).to eq(
        "I will submit the demolition application next week."
      )

      post "/api/permit_applications/#{revision_application.id}/submit",
           params: {
             permit_application: {
               submitter_note: "Updated before submit.",
               submission_data: revision_application.submission_data
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(revision_application.reload).to be_resubmitted
      expect(requested_version.reload.submitter_note).to eq(
        "Updated before submit."
      )
      expect(
        revision_application.latest_submission_version.submitter_note
      ).to be_nil
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

    it "persists a document request whose reference files stay out of the submission" do
      sign_in reviewer

      patch "/api/permit_applications/#{submitted_application.id}/revision_requests",
            params: {
              submission_version: {
                revision_requests_attributes: [
                  {
                    type: "SupportingDocumentRevisionRequest",
                    user_id: reviewer.id,
                    title: "Site plan",
                    comment: "Please provide a current site plan.",
                    revision_reference_documents_attributes: [
                      { file: cached_file_data },
                      { file: cached_file_data }
                    ]
                  }
                ]
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      request =
        submitted_application
          .reload
          .latest_submission_version
          .revision_requests
          .last
      expect(request).to be_a(SupportingDocumentRevisionRequest)
      expect(request.revision_reference_documents.count).to eq(2)
      expect(
        submitted_application.all_submission_version_completed_supporting_documents
      ).to be_empty
      completed_ids =
        json_response
          .dig("data", "all_submission_version_completed_supporting_documents")
          &.map { |doc| doc["id"] }
      expect(completed_ids).to eq([])
      expect(
        json_response
          .dig("data", "supporting_documents")
          &.map { |doc| doc["id"] }
      ).to eq([])
    end

    it "hides a document request from the submitter until finalize" do
      document_request =
        create(
          :supporting_document_revision_request,
          submission_version: submitted_application.latest_submission_version
        )
      create(:revision_reference_document, revision_request: document_request)
      create(:revision_reference_document, revision_request: document_request)

      sign_in submitter
      get "/api/permit_applications/#{submitted_application.id}",
          headers: headers

      expect(response).to have_http_status(:ok)
      version =
        json_response
          .dig("data", "submission_versions")
          &.find do |sv|
            sv["id"] == submitted_application.latest_submission_version.id
          end
      expect(version.fetch("revision_requests", [])).to eq([])
      expect(version["applicant_note"]).to be_nil

      allow(NotificationService).to receive(
        :publish_application_revisions_request_event
      )
      submitted_application.latest_submission_version.update!(
        applicant_note: "Please see the attached examples."
      )
      submitted_application.finalize_revision_requests!

      get "/api/permit_applications/#{submitted_application.id}",
          headers: headers

      version =
        json_response
          .dig("data", "submission_versions")
          &.find do |sv|
            sv["id"] == submitted_application.latest_submission_version.id
          end
      payload = version["revision_requests"].first
      expect(version["revision_requests"].length).to eq(1)
      expect(payload["title"]).to eq("Site photos")
      expect(payload["revision_reference_documents"].length).to eq(2)
      expect(version["applicant_note"]).to eq(
        "Please see the attached examples."
      )
      expect(
        json_response.dig(
          "data",
          "all_submission_version_completed_supporting_documents"
        )
      ).to eq([])
    end
  end

  describe "PATCH /api/permit_applications/:id/upload_supporting_document fulfillment" do
    let(:revision_application) do
      create(
        :permit_application,
        :revisions_requested,
        submitter: submitter,
        template_version: template_version,
        jurisdiction: jurisdiction
      )
    end
    let(:document_request) do
      create(
        :supporting_document_revision_request,
        submission_version: revision_application.latest_submission_version
      )
    end

    before do
      allow(PromoteJob).to receive(:perform_async)
      allow(VirusScanService).to receive(:new).and_return(
        instance_double(VirusScanService, scan!: true)
      )
      create(:revision_reference_document, revision_request: document_request)
    end

    def upload_fulfillment(revision_request_id, files: [cached_file_data])
      patch "/api/permit_applications/#{revision_application.id}/upload_supporting_document",
            params: {
              permit_application: {
                supporting_documents_attributes:
                  files.map { |file| { revision_request_id:, file: } }
              }
            },
            headers: headers,
            as: :json
    end

    it "saves fulfillment files on the request and includes them in the package" do
      upload_fulfillment(
        document_request.id,
        files: [cached_file_data, cached_file_data]
      )

      expect(response).to have_http_status(:ok)
      documents = document_request.supporting_documents.reload
      expect(documents.size).to eq(2)
      expect(documents.map(&:submission_version_id)).to all(be_nil)
      expect(documents.map(&:data_key)).to all(
        start_with("revision_fulfillment_#{document_request.id}_")
      )
      expect(documents.map(&:data_key).uniq.size).to eq(2)
      expect(
        revision_application.all_submission_version_completed_supporting_documents.map(
          &:id
        )
      ).to match_array(documents.map(&:id))

      version =
        json_response
          .dig("data", "submission_versions")
          &.find do |sv|
            sv["id"] == revision_application.latest_submission_version.id
          end
      payload =
        version["revision_requests"].find do |item|
          item["id"] == document_request.id
        end
      expect(payload["supporting_documents"].length).to eq(2)
      expect(payload["revision_reference_documents"].length).to eq(1)
    end

    it "rejects a destroy for a file that is not on the request" do
      other_document =
        create(:supporting_document, permit_application: revision_application)

      patch "/api/permit_applications/#{revision_application.id}/upload_supporting_document",
            params: {
              permit_application: {
                supporting_documents_attributes: [
                  {
                    id: other_document.id,
                    _destroy: true,
                    revision_request_id: document_request.id
                  }
                ]
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:bad_request)
      expect(other_document.reload).to be_persisted
    end

    it "forbids an unrelated submitter" do
      sign_in other_user

      upload_fulfillment(document_request.id)

      expect(response).to have_http_status(:forbidden)
      expect(document_request.supporting_documents).to be_empty
    end

    it "rejects a field revision id" do
      field_request =
        revision_application
          .latest_submission_version
          .revision_requests
          .find_by!(type: "FieldRevisionRequest")

      upload_fulfillment(field_request.id)

      expect(response).to have_http_status(:bad_request)
      expect(
        SupportingDocument.where(revision_request_id: field_request.id)
      ).to be_empty
    end

    it "forbids a reviewer" do
      sign_in create(:user, :reviewer, jurisdiction: jurisdiction)

      upload_fulfillment(document_request.id)

      expect(response).to have_http_status(:forbidden)
      expect(document_request.supporting_documents).to be_empty
    end

    it "stays draft-only when no revision request id is sent" do
      submitted_application =
        create(
          :permit_application,
          :newly_submitted,
          submitter: submitter,
          template_version: template_version,
          jurisdiction: jurisdiction
        )

      patch "/api/permit_applications/#{submitted_application.id}/upload_supporting_document",
            params: {
              permit_application: {
                supporting_documents_attributes: [
                  { data_key: "RB123", file: cached_file_data }
                ]
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:forbidden)
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

    it "returns 422 when the package is empty" do
      sign_in reviewer

      post "/api/permit_applications/#{submitted_application.id}/revision_requests/finalize",
           headers: headers

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "finalizes a package that only has a document request" do
      sign_in reviewer
      create(
        :supporting_document_revision_request,
        submission_version: submitted_application.latest_submission_version
      )
      allow(NotificationService).to receive(
        :publish_application_revisions_request_event
      )

      post "/api/permit_applications/#{submitted_application.id}/revision_requests/finalize",
           headers: headers

      expect(response).to have_http_status(:ok)
      expect(submitted_application.reload).to be_revisions_requested
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
      expect(permit_collaboration.reload.discarded?).to be(true)
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

  describe "POST /api/permit_applications/:id/download_supporting_documents_zip" do
    let(:document_ids) { %w[doc-1 doc-2] }

    it "enqueues a selective zip job and returns a request_id" do
      allow(SupportingDocumentsZipDownloadJob).to receive(:perform_async)

      post "/api/permit_applications/#{permit_application.id}/download_supporting_documents_zip",
           params: {
             supporting_document_ids: document_ids
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:accepted)
      request_id = json_response.dig("data", "request_id")
      expect(request_id).to be_present
      expect(SupportingDocumentsZipDownloadJob).to have_received(
        :perform_async
      ).with(permit_application.id, document_ids, request_id, submitter.id)
    end

    it "forbids users who cannot download" do
      sign_in other_user
      allow(SupportingDocumentsZipDownloadJob).to receive(:perform_async)

      post "/api/permit_applications/#{permit_application.id}/download_supporting_documents_zip",
           params: {
             supporting_document_ids: document_ids
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
      expect(SupportingDocumentsZipDownloadJob).not_to have_received(
        :perform_async
      )
    end
  end
end
