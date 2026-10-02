require "rails_helper"

RSpec.describe "Sandbox member lookups", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:jurisdiction) { create(:sub_district) }
  let(:sandbox) { jurisdiction.sandboxes.published.first }
  let(:staff) { create(:user, :review_manager, jurisdiction: jurisdiction) }
  let(:headers) { { "ACCEPT" => "application/json" } }
  let(:sandbox_headers) { headers.merge("X-Sandbox-ID" => sandbox.id) }

  before do
    sign_in staff
    SiteConfiguration.instance.update!(overheating_tool_enabled: true)
  end

  shared_examples "a sandbox-scoped lookup" do
    it "returns 404 in live mode" do
      perform(headers)

      expect(response).to have_http_status(:not_found)
    end

    it "succeeds in the record's sandbox" do
      perform(sandbox_headers)

      expect(response).to have_http_status(:ok)
    end
  end

  describe "pre-check" do
    let(:pre_check) { create(:pre_check, creator: staff, sandbox: sandbox) }

    def perform(request_headers)
      get "/api/pre_checks/#{pre_check.id}", headers: request_headers
    end

    it_behaves_like "a sandbox-scoped lookup"

    it "returns 404 for a different sandbox" do
      get "/api/pre_checks/#{pre_check.id}",
          headers:
            headers.merge(
              "X-Sandbox-ID" => jurisdiction.sandboxes.scheduled.first.id
            )

      expect(response).to have_http_status(:not_found)
    end

    it "returns 404 for a live record opened in training mode" do
      live = create(:pre_check, creator: staff)

      get "/api/pre_checks/#{live.id}", headers: sandbox_headers

      expect(response).to have_http_status(:not_found)
    end

    it "lets a super admin open their own pre-check in live mode" do
      admin = create(:user, :super_admin)
      owned = create(:pre_check, creator: admin, sandbox: sandbox)
      sign_in admin

      get "/api/pre_checks/#{owned.id}", headers: headers

      expect(response).to have_http_status(:ok)
    end
  end

  describe "a submitter" do
    let(:submitter) { create(:user, :submitter) }

    before { sign_in submitter }

    it "ignores the sandbox header and stays in live mode" do
      live = create(:pre_check, creator: submitter)
      sandboxed = create(:pre_check, creator: submitter, sandbox: sandbox)

      get "/api/pre_checks/#{live.id}", headers: sandbox_headers
      expect(response).to have_http_status(:ok)

      get "/api/pre_checks/#{sandboxed.id}", headers: sandbox_headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "standalone step code" do
    let(:step_code) do
      create(
        :part_9_step_code,
        permit_application: nil,
        creator: staff,
        sandbox: sandbox
      )
    end

    before { allow(StepCode.search_index).to receive(:refresh) }

    def perform(request_headers)
      delete "/api/step_codes/#{step_code.id}", headers: request_headers
    end

    it_behaves_like "a sandbox-scoped lookup"
  end

  describe "attached step code" do
    let(:permit_application) do
      create(
        :permit_application,
        jurisdiction: jurisdiction,
        sandbox: sandbox,
        submitter: create(:user, :submitter)
      )
    end
    let(:step_code) do
      create(
        :part_3_step_code,
        permit_application: permit_application,
        creator: staff
      )
    end

    it "follows the project sandbox when the step code column is empty" do
      expect(step_code.reload.read_attribute(:sandbox_id)).to be_nil

      get "/api/part_3_building/step_codes/#{step_code.id}", headers: headers
      expect(response).to have_http_status(:not_found)

      get "/api/part_3_building/step_codes/#{step_code.id}",
          headers: sandbox_headers
      expect(response).to have_http_status(:ok)
    end

    it "scopes the checklist through that step code" do
      checklist = step_code.pre_construction_checklist

      get "/api/part_3_building/checklists/#{checklist.id}", headers: headers
      expect(response).to have_http_status(:not_found)

      get "/api/part_3_building/checklists/#{checklist.id}",
          headers: sandbox_headers
      expect(response).to have_http_status(:ok)
    end
  end

  describe "overheating code" do
    let(:overheating_code) do
      create(:overheating_code, creator: staff, sandbox: sandbox)
    end

    def perform(request_headers)
      get "/api/overheating_codes/#{overheating_code.id}",
          headers: request_headers
    end

    it_behaves_like "a sandbox-scoped lookup"
  end

  describe "design document download" do
    let(:design_document) do
      create(
        :design_document,
        pre_check: create(:pre_check, creator: staff, sandbox: sandbox)
      )
    end

    def perform(request_headers)
      get "/api/s3/params/download",
          params: {
            model: "DesignDocument",
            modelId: design_document.id
          },
          headers: request_headers
    end

    it_behaves_like "a sandbox-scoped lookup"
  end

  describe "note attachment download" do
    let(:note_attachment) do
      project =
        create(
          :permit_project,
          owner: staff,
          jurisdiction: jurisdiction,
          sandbox: sandbox
        )
      note =
        create(
          :note,
          user: staff,
          noteable: create(:project_meeting, :open, permit_project: project)
        )
      create(:note_attachment_document, note: note)
    end

    def perform(request_headers)
      get "/api/s3/params/download",
          params: {
            model: "NoteAttachmentDocument",
            modelId: note_attachment.id
          },
          headers: request_headers
    end

    it_behaves_like "a sandbox-scoped lookup"
  end

  describe "permit collaboration" do
    let(:collaboration) do
      application =
        create(
          :permit_application,
          jurisdiction: jurisdiction,
          sandbox: sandbox,
          submitter: create(:user, :submitter)
        )
      application.update_column(
        :status,
        PermitApplication.statuses[:newly_submitted]
      )
      collaborator =
        jurisdiction.collaborators.find_by(user_id: staff.id) ||
          create(:collaborator, user: staff, collaboratorable: jurisdiction)
      create(
        :permit_collaboration,
        permit_application: application,
        collaborator: collaborator,
        collaboration_type: :review
      )
    end

    def perform(request_headers)
      delete "/api/permit_collaborations/#{collaboration.id}",
             headers: request_headers
    end

    it_behaves_like "a sandbox-scoped lookup"
  end

  describe "permit application reorder" do
    let(:permit_application) do
      create(
        :permit_application,
        jurisdiction: jurisdiction,
        sandbox: sandbox,
        submitter: create(:user, :submitter)
      )
    end

    def perform(request_headers)
      patch "/api/permit_applications/reorder",
            params: {
              items: [{ id: permit_application.id, inbox_sort_order: 1 }]
            },
            headers: request_headers,
            as: :json
    end

    it_behaves_like "a sandbox-scoped lookup"
  end
end
