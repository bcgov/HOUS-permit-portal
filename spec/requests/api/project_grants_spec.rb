require "rails_helper"

RSpec.describe "project grants", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:headers) { { "ACCEPT" => "application/json" } }
  let(:owner) { create(:user, :submitter) }
  let(:standard_user) { create(:user, :submitter) }
  let(:expanded_user) { create(:user, :submitter) }
  let(:jurisdiction) { create(:sub_district) }
  let(:project) do
    create(:permit_project, owner: owner, jurisdiction: jurisdiction)
  end
  let(:granted_block_id) { SecureRandom.uuid }
  let(:other_block_id) { SecureRandom.uuid }
  let(:application) do
    create(
      :permit_application,
      submitter: owner,
      permit_project: project,
      jurisdiction: jurisdiction,
      with_fake_plan_document: true
    )
  end
  let(:other_application) do
    create(
      :permit_application,
      submitter: owner,
      permit_project: project,
      jurisdiction: jurisdiction,
      template_version: application.template_version
    )
  end
  let!(:standard_membership) do
    create(
      :project_membership,
      permit_project: project,
      user: standard_user,
      access: :limited
    )
  end
  let!(:expanded_membership) do
    create(
      :project_membership,
      permit_project: project,
      user: expanded_user,
      access: :expanded
    )
  end

  before do
    application.template_version.update!(
      form_json: {
        "components" => [
          {
            "id" => "section-1",
            "components" => [
              {
                "id" => granted_block_id,
                "key" => "granted",
                "components" => []
              },
              { "id" => other_block_id, "key" => "other", "components" => [] }
            ]
          }
        ]
      },
      requirement_blocks_json: {
        granted_block_id => {
          "name" => "Granted",
          "requirements" => [
            { "id" => SecureRandom.uuid, "input_type" => "text" }
          ]
        },
        other_block_id => {
          "name" => "Energy",
          "requirements" => [
            { "id" => SecureRandom.uuid, "input_type" => "energy_step_code" }
          ]
        }
      }
    )
  end

  def block_ids_in(payload)
    sections = payload.dig("form_json", "components") || []
    sections
      .flat_map { |section| section["components"] || [] }
      .map { |block| block["id"] }
  end

  def grant_block!(app = application, block_id = granted_block_id)
    create(
      :project_grant,
      project_membership: standard_membership,
      permit_application: app,
      kind: :block,
      requirement_block_id: block_id
    )
  end

  describe "a block grant" do
    before { grant_block! }

    it "opens that application, hides the other block, and drops the other block's save" do
      allow(AutomatedCompliance::AutopopulateJob).to receive(:perform_async)
      sign_in standard_user

      get "/api/permit_applications/#{application.id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(block_ids_in(json_response["data"])).to eq([granted_block_id])

      get "/api/permit_applications/#{other_application.id}", headers: headers

      expect(response).to have_http_status(:forbidden)

      patch "/api/permit_applications/#{application.id}",
            params: {
              permit_application: {
                submission_data: {
                  data: {
                    site: {
                      "answer|RB#{granted_block_id}" => "yes",
                      "answer|RB#{other_block_id}" => "no"
                    }
                  }
                }
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      saved = application.reload.submission_data.dig("data", "site")
      expect(saved).to include("answer|RB#{granted_block_id}" => "yes")
      expect(saved).not_to have_key("answer|RB#{other_block_id}")
    end

    it "downloads and uploads only the granted block, including the zip" do
      granted_file =
        create(
          :supporting_document,
          permit_application: application,
          data_key: "file|RB#{granted_block_id}"
        )
      other_file =
        create(
          :supporting_document,
          permit_application: application,
          data_key: "file|RB#{other_block_id}"
        )
      allow_any_instance_of(
        FileUploadAttachment::FilenamePreservingFileUrl
      ).to receive(:file_url).and_return("http://files.example/granted.pdf")
      allow(PromoteJob).to receive(:perform_async)
      allow(VirusScanService).to receive(:new).and_return(
        instance_double(VirusScanService, scan!: true)
      )
      allow(SupportingDocumentsZipDownloadJob).to receive(:perform_async)
      sign_in standard_user

      get "/api/s3/params/download",
          params: {
            model: "SupportingDocument",
            modelId: granted_file.id
          },
          headers: headers

      expect(response).to have_http_status(:ok)

      get "/api/s3/params/download",
          params: {
            model: "SupportingDocument",
            modelId: other_file.id
          },
          headers: headers

      expect(response).to have_http_status(:forbidden)

      patch "/api/permit_applications/#{application.id}/upload_supporting_document",
            params: {
              permit_application: {
                supporting_documents_attributes: [
                  {
                    data_key: "upload|RB#{other_block_id}",
                    file: TestData.cached_file_data
                  }
                ]
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:forbidden)

      patch "/api/permit_applications/#{application.id}/upload_supporting_document",
            params: {
              permit_application: {
                supporting_documents_attributes: [
                  {
                    data_key: "upload|RB#{granted_block_id}",
                    file: TestData.cached_file_data
                  }
                ]
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)

      post "/api/permit_applications/#{application.id}/download_supporting_documents_zip",
           params: {
             supporting_document_ids: [granted_file.id, other_file.id]
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)

      post "/api/permit_applications/#{application.id}/download_supporting_documents_zip",
           params: {
             supporting_document_ids: [granted_file.id]
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:accepted)
      expect(SupportingDocumentsZipDownloadJob).to have_received(
        :perform_async
      ).with(
        application.id,
        [granted_file.id],
        a_kind_of(String),
        standard_user.id
      )
    end

    it "updates the template version and acknowledges electives for any block on that draft" do
      allow(TemplateVersioningService).to receive(
        :update_draft_permit_with_new_template_version
      ).and_return(true)
      sign_in standard_user

      patch "/api/permit_applications/#{application.id}/update_version",
            headers: headers
      expect(response).to have_http_status(:ok)

      post "/api/permit_applications/#{application.id}/acknowledge_published_electives",
           params: {
             customization_change_id: SecureRandom.uuid
           },
           headers: headers,
           as: :json
      expect(response).to have_http_status(:ok)

      patch "/api/permit_applications/#{other_application.id}/update_version",
            headers: headers
      expect(response).to have_http_status(:forbidden)
    end

    it "shows Step Code for the grant and edits it only when the energy block is granted" do
      step_code =
        create(
          :part_9_step_code,
          permit_application: application,
          creator: owner
        )
      allow_any_instance_of(PermitApplication).to receive(
        :step_code_plan_document
      ).and_return(
        Struct.new(:last_signer, :file_data).new(
          { name: "Signer", date: Time.current },
          { "metadata" => { "filename" => "plan.pdf" } }
        )
      )
      sign_in standard_user

      get "/api/part_9_building/step_codes/#{step_code.id}", headers: headers
      expect(response).to have_http_status(:ok)

      patch "/api/step_codes/#{step_code.id}",
            params: {
              step_code: {
                phase: "dwelling"
              }
            },
            headers: headers,
            as: :json
      expect(response).to have_http_status(:forbidden)

      grant_block!(application, other_block_id)

      patch "/api/step_codes/#{step_code.id}",
            params: {
              step_code: {
                phase: "dwelling"
              }
            },
            headers: headers,
            as: :json
      expect(response).to have_http_status(:ok)
      expect(step_code.reload.phase).to eq("dwelling")
    end
  end

  describe "revision responses" do
    let(:submitted) do
      create(
        :permit_application,
        :newly_submitted,
        submitter: owner,
        permit_project: project,
        jurisdiction: jurisdiction,
        template_version: application.template_version
      )
    end

    it "limits a field response to the granted block and keeps submission actions on an application grant" do
      granted_request =
        create(
          :revision_request,
          submission_version: submitted.latest_submission_version,
          requirement_json: {
            "key" => "q|RB#{granted_block_id}"
          }
        )
      other_request =
        create(
          :revision_request,
          submission_version: submitted.latest_submission_version,
          requirement_json: {
            "key" => "q|RB#{other_block_id}"
          }
        )
      document_request =
        create(
          :supporting_document_revision_request,
          submission_version: submitted.latest_submission_version
        )
      reference =
        create(:revision_reference_document, revision_request: document_request)
      grant_block!(submitted)
      sign_in standard_user

      reference_ids = -> do
        (
          json_response.dig("data", "submission_versions") || []
        ).flat_map do |version|
          (version["revision_requests"] || []).flat_map do |request|
            (request["revision_reference_documents"] || []).map do |doc|
              doc["id"]
            end
          end
        end
      end
      request_ids = -> do
        (
          json_response.dig("data", "submission_versions") || []
        ).flat_map do |version|
          (version["revision_requests"] || []).map { |request| request["id"] }
        end
      end

      get "/api/permit_applications/#{submitted.id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(reference_ids.call).not_to include(reference.id)

      allow(NotificationService).to receive(
        :publish_application_revisions_request_event
      )
      submitted.finalize_revision_requests!

      get "/api/permit_applications/#{submitted.id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(reference_ids.call).to include(reference.id)
      expect(request_ids.call).to include(
        granted_request.id,
        document_request.id
      )
      expect(request_ids.call).not_to include(other_request.id)

      allow(AutomatedCompliance::AutopopulateJob).to receive(:perform_async)
      patch "/api/permit_applications/#{submitted.id}",
            params: {
              permit_application: {
                submission_data: {
                  data: {
                    site: {
                      "answer|RB#{granted_block_id}" => "fixed",
                      "answer|RB#{other_block_id}" => "nope"
                    }
                  }
                }
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      saved = submitted.reload.submission_data.dig("data", "site")
      expect(saved).to include("answer|RB#{granted_block_id}" => "fixed")
      expect(saved).not_to have_key("answer|RB#{other_block_id}")

      patch "/api/permit_applications/#{submitted.id}/submitter_note",
            params: {
              permit_application: {
                submitter_note: "Updated the granted block."
              }
            },
            headers: headers,
            as: :json
      expect(response).to have_http_status(:forbidden)

      allow(PromoteJob).to receive(:perform_async)
      allow(VirusScanService).to receive(:new).and_return(
        instance_double(VirusScanService, scan!: true)
      )
      patch "/api/permit_applications/#{submitted.id}/upload_supporting_document",
            params: {
              permit_application: {
                supporting_documents_attributes: [
                  {
                    revision_request_id: document_request.id,
                    file: TestData.cached_file_data
                  }
                ]
              }
            },
            headers: headers,
            as: :json
      expect(response).to have_http_status(:forbidden)

      create(
        :project_grant,
        :application,
        project_membership: standard_membership,
        permit_application: submitted
      )

      get "/api/permit_applications/#{submitted.id}", headers: headers
      expect(request_ids.call).to include(other_request.id)

      patch "/api/permit_applications/#{submitted.id}/submitter_note",
            params: {
              permit_application: {
                submitter_note: "Updated the granted block."
              }
            },
            headers: headers,
            as: :json
      expect(response).to have_http_status(:ok)
      expect(submitted.latest_submission_version.reload.submitter_note).to eq(
        "<p>Updated the granted block.</p>"
      )

      patch "/api/permit_applications/#{submitted.id}/upload_supporting_document",
            params: {
              permit_application: {
                supporting_documents_attributes: [
                  {
                    revision_request_id: document_request.id,
                    file: TestData.cached_file_data
                  }
                ]
              }
            },
            headers: headers,
            as: :json
      expect(response).to have_http_status(:ok)
    end

    it "fails template version, electives, the response note, and additional information with no block grant" do
      sign_in standard_user

      patch "/api/permit_applications/#{application.id}/update_version",
            headers: headers
      expect(response).to have_http_status(:forbidden)

      post "/api/permit_applications/#{application.id}/acknowledge_published_electives",
           params: {
             customization_change_id: SecureRandom.uuid
           },
           headers: headers,
           as: :json
      expect(response).to have_http_status(:forbidden)

      document_request =
        create(
          :supporting_document_revision_request,
          submission_version: submitted.latest_submission_version
        )
      allow(NotificationService).to receive(
        :publish_application_revisions_request_event
      )
      submitted.finalize_revision_requests!
      patch "/api/permit_applications/#{submitted.id}/submitter_note",
            params: {
              permit_application: {
                submitter_note: "Should not stick."
              }
            },
            headers: headers,
            as: :json
      expect(response).to have_http_status(:forbidden)

      patch "/api/permit_applications/#{submitted.id}/upload_supporting_document",
            params: {
              permit_application: {
                supporting_documents_attributes: [
                  {
                    revision_request_id: document_request.id,
                    file: TestData.cached_file_data
                  }
                ]
              }
            },
            headers: headers,
            as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "assigning grants" do
    it "lets Full and Expanded create and remove block and application grants" do
      sign_in owner

      post "/api/permit_applications/#{application.id}/project_grants",
           params: {
             grant: {
               membership_id: standard_membership.id,
               kind: "block",
               requirement_block_id: granted_block_id
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:created)
      block_grant = ProjectGrant.find(json_response.dig("data", "id"))
      expect(block_grant).to be_block

      sign_in expanded_user
      post "/api/permit_applications/#{application.id}/project_grants",
           params: {
             grant: {
               membership_id: standard_membership.id,
               kind: "application"
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:created)
      submit_grant = ProjectGrant.find(json_response.dig("data", "id"))

      delete "/api/permit_applications/#{application.id}/project_grants/#{submit_grant.id}",
             headers: headers
      expect(response).to have_http_status(:no_content)
      expect(ProjectGrant.exists?(submit_grant.id)).to be false

      sign_in owner
      delete "/api/permit_applications/#{application.id}/project_grants/#{block_grant.id}",
             headers: headers
      expect(response).to have_http_status(:no_content)
    end

    it "denies Limited, a grant to yourself, and a Full member of another project" do
      outsider = create(:user, :submitter)
      create(
        :permit_application,
        submitter: outsider,
        jurisdiction: jurisdiction,
        template_version: application.template_version
      )
      owner_membership = project.project_memberships.find_by!(user: owner)

      sign_in standard_user
      expect {
        post "/api/permit_applications/#{application.id}/project_grants",
             params: {
               grant: {
                 membership_id: expanded_membership.id,
                 kind: "block",
                 requirement_block_id: granted_block_id
               }
             },
             headers: headers,
             as: :json
      }.not_to change(ProjectGrant, :count)
      expect(response).to have_http_status(:forbidden)

      sign_in owner
      post "/api/permit_applications/#{application.id}/project_grants",
           params: {
             grant: {
               membership_id: owner_membership.id,
               kind: "application"
             }
           },
           headers: headers,
           as: :json
      expect(response).to have_http_status(:forbidden)

      sign_in outsider
      post "/api/permit_applications/#{application.id}/project_grants",
           params: {
             grant: {
               membership_id: standard_membership.id,
               kind: "block",
               requirement_block_id: granted_block_id
             }
           },
           headers: headers,
           as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it "lets a Limited member with an application grant reach submit and see every block" do
      sign_in owner
      post "/api/permit_applications/#{application.id}/project_grants",
           params: {
             grant: {
               membership_id: standard_membership.id,
               kind: "application"
             }
           },
           headers: headers,
           as: :json
      expect(response).to have_http_status(:created)

      sign_in standard_user
      get "/api/permit_applications/#{application.id}", headers: headers
      expect(response).to have_http_status(:ok)
      expect(block_ids_in(json_response["data"])).to contain_exactly(
        granted_block_id,
        other_block_id
      )

      post "/api/permit_applications/#{application.id}/submit",
           params: {
             permit_application: {
               submission_data: {
                 data: {
                 }
               }
             }
           },
           headers: headers,
           as: :json

      expect(response).not_to have_http_status(:forbidden)
      expect(application.reload).to be_new_draft
      expect(standard_membership.project_grants.application).to exist
    end
  end

  describe "an invite grant" do
    before do
      create(:project_grant, :invite, project_membership: expanded_membership)
    end

    it "lets Expanded invite below Full, and keeps the invited email on re-send" do
      sign_in expanded_user

      post "/api/permit_projects/#{project.id}/memberships",
           params: {
             membership: {
               first_name: "Wanda",
               last_name: "Walls",
               email: "wanda-expanded@example.com",
               access: "expanded"
             }
           },
           headers: headers,
           as: :json
      expect(response).to have_http_status(:created)

      post "/api/permit_projects/#{project.id}/memberships",
           params: {
             membership: {
               first_name: "Sam",
               last_name: "Standard",
               email: "sam-standard@example.com",
               access: "limited"
             }
           },
           headers: headers,
           as: :json
      expect(response).to have_http_status(:created)

      expect {
        post "/api/permit_projects/#{project.id}/memberships",
             params: {
               membership: {
                 first_name: "Fran",
                 last_name: "Full",
                 email: "fran-full@example.com",
                 access: "full"
               }
             },
             headers: headers,
             as: :json
      }.not_to change(ProjectMembership, :count)
      expect(response).to have_http_status(:forbidden)

      pending =
        create(
          :project_membership,
          :pending_invitation,
          permit_project: project,
          access: :limited
        )
      email = pending.invited_email
      post "/api/permit_projects/#{project.id}/memberships/#{pending.id}/reinvite",
           headers: headers,
           as: :json
      expect(response).to have_http_status(:ok)
      expect(pending.reload.invited_email).to eq(email)

      delete "/api/permit_projects/#{project.id}/memberships/#{pending.id}",
             headers: headers
      expect(response).to have_http_status(:ok)
      expect(ProjectMembership.exists?(pending.id)).to be false
    end

    it "refuses re-send and cancel of a Full invite, and refuses Limited" do
      full_invite =
        create(
          :project_membership,
          :pending_invitation,
          permit_project: project,
          access: :full
        )
      sign_in expanded_user

      post "/api/permit_projects/#{project.id}/memberships/#{full_invite.id}/reinvite",
           headers: headers,
           as: :json
      expect(response).to have_http_status(:forbidden)

      delete "/api/permit_projects/#{project.id}/memberships/#{full_invite.id}",
             headers: headers
      expect(response).to have_http_status(:forbidden)
      expect(full_invite.reload.invited_email).to be_present

      sign_in standard_user
      post "/api/permit_projects/#{project.id}/memberships",
           params: {
             membership: {
               first_name: "Nope",
               last_name: "Standard",
               email: "nope-standard@example.com",
               access: "limited"
             }
           },
           headers: headers,
           as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it "lets Full create the invite grant and denies Expanded creating one" do
      expanded_membership.project_grants.destroy_all
      other_expanded =
        create(
          :project_membership,
          permit_project: project,
          user: create(:user, :submitter),
          access: :expanded
        )
      sign_in expanded_user

      post "/api/permit_projects/#{project.id}/memberships/#{other_expanded.id}/project_grants",
           headers: headers,
           as: :json
      expect(response).to have_http_status(:forbidden)

      sign_in owner
      post "/api/permit_projects/#{project.id}/memberships/#{other_expanded.id}/project_grants",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:created)
      expect(other_expanded.project_grants.invite).to exist

      delete "/api/permit_projects/#{project.id}/memberships/#{other_expanded.id}/project_grants/#{other_expanded.project_grants.invite.pick(:id)}",
             headers: headers
      expect(response).to have_http_status(:no_content)
    end
  end

  describe "GET /api/permit_applications/:id/project_grants" do
    it "lists the application's grants for someone who can open it" do
      grant = grant_block!
      sign_in standard_user

      get "/api/permit_applications/#{application.id}/project_grants",
          headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].map { |row| row["id"] }).to include(grant.id)

      sign_in create(:user, :submitter)
      get "/api/permit_applications/#{application.id}/project_grants",
          headers: headers
      expect(response).to have_http_status(:forbidden)
    end

    it "lists the application's grants for review staff who can open it" do
      grant = grant_block!
      create(:project_meeting, :open, permit_project: project)
      sign_in create(:user, :reviewer, jurisdiction: jurisdiction)

      get "/api/permit_applications/#{application.id}/project_grants",
          headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].map { |row| row["id"] }).to include(grant.id)
    end
  end
end
