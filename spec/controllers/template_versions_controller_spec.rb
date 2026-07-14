require "rails_helper"

RSpec.describe Api::TemplateVersionsController,
               type: :controller,
               search: true do
  let!(:jurisdiction) { create(:sub_district) }
  let!(:review_manager) do
    create(:user, :review_manager, jurisdiction: jurisdiction)
  end

  let!(:source_template) do
    create(:live_requirement_template, nickname: "Source Template")
  end
  let!(:source_version) do
    create(:template_version, requirement_template: source_template)
  end
  let!(:target_template) do
    create(:live_requirement_template, nickname: "Target Template")
  end
  let!(:target_version) do
    create(:template_version, requirement_template: target_template)
  end

  let!(:customization) do
    create(
      :jurisdiction_template_version_customization,
      template_version: source_version,
      jurisdiction: jurisdiction,
      customizations: {
        "requirement_block_changes" => {
          "bf79e81c-4b27-43f9-8e05-3ece85613960" => {
            "tip" => "<p>TIP ON CONTACT</p>",
            "enabled_elective_field_ids" => %w[
              34798177-1705-4215-9268-96456670d64a
              de0631d8-e65a-438a-ac72-dfc69995b7b3
              365268e6-0a22-44df-9027-f5a0985ed7c1
            ],
            "enabled_elective_field_reasons" => {
              "34798177-1705-4215-9268-96456670d64a" => "bylaw",
              "365268e6-0a22-44df-9027-f5a0985ed7c1" => "policy",
              "de0631d8-e65a-438a-ac72-dfc69995b7b3" => "zoning"
            }
          }
        }
      }
    )
  end
  before { sign_in review_manager }

  describe "GET #show_jurisdiction_template_version_customization" do
    it "returns requires_project_meeting after it is updated" do
      post :create_or_update_jurisdiction_template_version_customization,
           params: {
             id: source_version.id,
             jurisdiction_id: jurisdiction.id,
             jurisdiction_template_version_customization: {
               requires_project_meeting: true
             }
           }

      expect(response).to have_http_status(:success)
      expect(json_response.dig("data", "requires_project_meeting")).to be(true)

      get :show_jurisdiction_template_version_customization,
          params: {
            id: source_version.id,
            jurisdiction_id: jurisdiction.id
          }

      expect(response).to have_http_status(:success)
      expect(json_response.dig("data", "requires_project_meeting")).to be(true)
    end
  end

  describe "GET #index" do
    it "serializes jurisdiction-scoped settings for template versions" do
      customization.update!(disabled: true, requires_project_meeting: true)

      get :index,
          params: {
            status: "published",
            jurisdiction_id: jurisdiction.id
          }

      expect(response).to have_http_status(:success)
      template_payload =
        json_response["data"].find do |payload|
          payload["id"] == source_version.id
        end

      expect(template_payload["disabled_by_jurisdiction"]).to be(true)
      expect(template_payload["requires_project_meeting"]).to be(true)
    end

    it "returns summary metadata without snapshot or form payloads" do
      get :index, params: { status: "published" }

      template_payload =
        json_response["data"].find do |payload|
          payload["id"] == source_version.id
        end

      expect(template_payload.dig("summary", "nickname")).to eq(
        source_template.nickname
      )
      expect(template_payload).not_to have_key("outline")
      expect(template_payload).not_to have_key("form_json")
      expect(template_payload).not_to have_key("blocks")
      expect(template_payload).not_to have_key("snapshot_json")
    end
  end

  describe "focused TemplateVersion projections" do
    it "returns only version metadata and summary from summary" do
      get :summary, params: { id: source_version.id }

      expect(response).to have_http_status(:success)
      expect(json_response.dig("data", "summary", "nickname")).to eq(
        source_template.nickname
      )
      expect(json_response["data"]).not_to have_key("outline")
      expect(json_response["data"]).not_to have_key("form_json")
      expect(json_response["data"]).not_to have_key("blocks")
    end

    it "returns outline but not the compiled form from show" do
      get :show, params: { id: source_version.id }

      expect(response).to have_http_status(:success)
      expect(json_response["data"]).to have_key("outline")
      expect(json_response["data"]).not_to have_key("form_json")
      expect(json_response["data"]).not_to have_key("blocks")
    end

    it "returns the compiled form without the outline from form_preview" do
      source_version.update_columns(
        form_json: {
          "components" => [{ "id" => "section-1" }]
        }
      )

      get :form_preview, params: { id: source_version.id }

      expect(response).to have_http_status(:success)
      expect(json_response.dig("data", "form_json", "components")).to eq(
        [{ "id" => "section-1" }]
      )
      expect(json_response["data"]).not_to have_key("outline")
      expect(json_response["data"]).not_to have_key("blocks")
    end

    it "returns canonical blocks with the integration mapping response" do
      source_version.update_columns(
        snapshot_json:
          source_version.snapshot_json.merge(
            "blocks" => {
              "block-1" => {
                "id" => "block-1",
                "sku" => "BLOCK",
                "requirements" => []
              }
            }
          )
      )

      get :show_integration_mapping,
          params: {
            id: source_version.id,
            jurisdiction_id: jurisdiction.id
          }

      expect(response).to have_http_status(:success)
      expect(json_response.dig("data", "blocks").keys).to eq(["block-1"])
      expect(json_response["data"]).not_to have_key("outline")
      expect(json_response["data"]).not_to have_key("form_json")
    end
  end

  describe "POST #copy_jurisdiction_template_version_customization" do
    context "when include_electives is true" do
      it "copies the elective fields" do
        post :copy_jurisdiction_template_version_customization,
             params: {
               jurisdiction_id: jurisdiction.id,
               id: target_version.id,
               from_template_version_id: source_version.id,
               include_electives: true
             }
        expect(response).to have_http_status(:success)
        new_customization =
          JurisdictionTemplateVersionCustomization.order(
            created_at: :desc
          ).first
        block_changes =
          new_customization.customizations["requirement_block_changes"]
        expect(block_changes).to eq(
          {
            "bf79e81c-4b27-43f9-8e05-3ece85613960" => {
              "enabled_elective_field_ids" => %w[
                34798177-1705-4215-9268-96456670d64a
                de0631d8-e65a-438a-ac72-dfc69995b7b3
                365268e6-0a22-44df-9027-f5a0985ed7c1
              ],
              "enabled_elective_field_reasons" => {
                "34798177-1705-4215-9268-96456670d64a" => "bylaw",
                "365268e6-0a22-44df-9027-f5a0985ed7c1" => "policy",
                "de0631d8-e65a-438a-ac72-dfc69995b7b3" => "zoning"
              }
            }
          }
        )
        expect(block_changes).not_to include("tip")
      end
    end

    context "when include_tips is true" do
      it "copies the tips and not the elective fields" do
        post :copy_jurisdiction_template_version_customization,
             params: {
               jurisdiction_id: jurisdiction.id,
               id: target_version.id,
               from_template_version_id: source_version.id,
               include_tips: true
             }

        expect(response).to have_http_status(:success)
        new_customization =
          JurisdictionTemplateVersionCustomization.order(
            created_at: :desc
          ).first
        block_changes =
          new_customization.customizations["requirement_block_changes"]

        expect(block_changes).to eq(
          {
            "bf79e81c-4b27-43f9-8e05-3ece85613960" => {
              "tip" => "<p>TIP ON CONTACT</p>"
            }
          }
        )
        expect(block_changes).not_to include("enabled_elective_field_ids")
        expect(block_changes).not_to include("enabled_elective_field_reasons")
      end
    end
  end

  describe "draft workflow actions" do
    let(:requirement_template) do
      create(:live_full_requirement_template, sections_count: 1)
    end
    let!(:draft_version) do
      TemplateVersioningService.create_draft!(requirement_template)
    end
    let!(:other_draft_version) do
      TemplateVersioningService.create_draft!(requirement_template)
    end

    context "as a super admin" do
      let(:super_admin) { create(:user, :super_admin) }

      before { sign_in super_admin }

      it "creates a scheduled version from the selected draft" do
        expect {
          post :promote_draft,
               params: {
                 id: draft_version.id,
                 version_date: Date.tomorrow.to_s
               }
        }.to change { requirement_template.template_versions.count }.by(1)

        expect(response).to have_http_status(:success)

        draft_version.reload
        other_draft_version.reload
        promoted_version =
          requirement_template
            .template_versions
            .where(status: :scheduled)
            .where.not(id: [draft_version.id, other_draft_version.id])
            .order(created_at: :desc)
            .first

        expect(draft_version.status).to eq("draft")
        expect(other_draft_version.status).to eq("draft")
        expect(promoted_version.version_date).to eq(Date.tomorrow)
      end

      it "auto-unschedules sibling scheduled versions with earlier dates" do
        earlier_scheduled =
          TemplateVersioningService.schedule!(
            requirement_template,
            Date.tomorrow
          )

        post :promote_draft,
             params: {
               id: draft_version.id,
               version_date: (Date.tomorrow + 3).to_s
             }

        expect(response).to have_http_status(:success)
        earlier_scheduled.reload
        expect(earlier_scheduled.status).to eq("deprecated")
        expect(earlier_scheduled.deprecation_reason).to eq("unscheduled")
      end

      it "discards only the selected draft version" do
        delete :discard_draft, params: { id: draft_version.id }

        expect(response).to have_http_status(:success)
        draft_version.reload
        other_draft_version.reload
        expect(draft_version.status).to eq("deprecated")
        expect(draft_version.deprecation_reason).to eq("unscheduled")
        expect(draft_version.deprecated_by).to eq(super_admin)
        expect(other_draft_version.status).to eq("draft")
      end

      it "rejects promote for non-draft versions" do
        post :promote_draft,
             params: {
               id: target_version.id,
               version_date: Date.tomorrow.to_s
             }

        expect(response).to have_http_status(:forbidden)
      end

      context "with skip_date_check: true" do
        around do |example|
          original = ENV["ENABLE_TEMPLATE_FORCE_PUBLISH"]
          ENV["ENABLE_TEMPLATE_FORCE_PUBLISH"] = env_flag
          example.run
        ensure
          ENV["ENABLE_TEMPLATE_FORCE_PUBLISH"] = original
        end

        context "when ENABLE_TEMPLATE_FORCE_PUBLISH is not set" do
          let(:env_flag) { "false" }

          it "is forbidden by policy" do
            post :promote_draft,
                 params: {
                   id: draft_version.id,
                   skip_date_check: true
                 }

            expect(response).to have_http_status(:forbidden)
          end
        end

        context "when ENABLE_TEMPLATE_FORCE_PUBLISH is set" do
          let(:env_flag) { "true" }

          before do
            allow(WebsocketBroadcaster).to receive(
              :push_update_to_relevant_users
            )
          end

          it "publishes a copy inline with today's date and keeps drafts" do
            expect {
              post :promote_draft,
                   params: {
                     id: draft_version.id,
                     skip_date_check: true
                   }
            }.to change { requirement_template.template_versions.count }.by(1)

            expect(response).to have_http_status(:success)
            draft_version.reload
            other_draft_version.reload
            promoted_version =
              requirement_template
                .template_versions
                .where(status: :published)
                .where.not(id: [draft_version.id, other_draft_version.id])
                .order(created_at: :desc)
                .first

            expect(draft_version.status).to eq("draft")
            expect(other_draft_version.status).to eq("draft")
            expect(promoted_version.version_date).to eq(Date.current)
          end
        end
      end
    end

    context "as a non-admin user" do
      it "denies access" do
        post :promote_draft,
             params: {
               id: draft_version.id,
               version_date: Date.tomorrow.to_s
             }

        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
