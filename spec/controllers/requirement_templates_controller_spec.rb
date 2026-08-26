# spec/controllers/api/requirement_templates_controller_spec.rb
require "rails_helper"

RSpec.describe Api::RequirementTemplatesController,
               type: :controller,
               search: true do
  let!(:super_admin) { create(:user, :super_admin) }

  describe "POST #create" do
    before { sign_in super_admin }

    context "It creates a live requirement template" do
      it "returns a successful response with the correct data structure" do
        post :create,
             params: {
               requirement_template: {
                 description: "a template of some description",
                 nickname: "Test Template",
                 tag_list: ["Part 9", "New Construction"],
                 requirement_template_sections_attributes: [
                   { name: "one section", position: 1 }
                 ]
               }
             }
        expect(response).to have_http_status(:success)
        expect(json_response).to include("meta", "data")
        expect(json_response["data"]["description"]).to eq(
          "a template of some description"
        )
      end

      it "creates a requirement template with a unique nickname" do
        create(:live_requirement_template, nickname: "Existing Template")

        expect {
          post :create,
               params: {
                 requirement_template: {
                   description: "a new template",
                   nickname: "Existing Template",
                   requirement_template_sections_attributes: [
                     { name: "another section", position: 1 }
                   ]
                 }
               }
        }.not_to change(RequirementTemplate, :count)

        expect(response).to have_http_status(:bad_request)
      end

      it "copies sections from an existing requirement template when providing an id to the copy endpoint" do
        source_template =
          create(
            :live_requirement_template,
            nickname: "Source Template",
            requirement_template_sections_attributes: [
              { name: "existing section one", position: 1 },
              { name: "existing section two", position: 2 }
            ]
          )

        expect {
          post :copy,
               params: {
                 requirement_template: {
                   id: source_template.id,
                   description: "a copied template",
                   nickname: "Copied Template"
                 }
               }
        }.to change(RequirementTemplate, :count).by(1)

        expect(response).to have_http_status(:success)
        new_template = RequirementTemplate.order(created_at: :asc).last
        expect(new_template.description).to eq("a copied template")
        expect(
          new_template.requirement_template_sections.map(&:name)
        ).to match_array(["existing section one", "existing section two"])
        expect(
          new_template.requirement_template_sections.map(&:position)
        ).to match_array([1, 2])
      end
    end
  end

  describe "PATCH #update" do
    let(:requirement_template) do
      create(
        :live_requirement_template_with_sections,
        description: "Original Description",
        nickname: "Original Nickname"
      )
    end

    let(:valid_attributes) do
      {
        description: "Updated Description",
        nickname: "Updated Nickname",
        tag_list: ["Part 9", "Demolition"],
        requirement_template_sections_attributes: [
          {
            id: requirement_template.requirement_template_sections.first.id,
            name: "Updated Section",
            position: 1
          }
        ]
      }
    end

    context "when the user is authenticated as a super admin" do
      before { sign_in super_admin }

      context "with valid parameters" do
        it "updates the requirement template and returns a success response" do
          patch :update,
                params: {
                  id: requirement_template.id,
                  requirement_template: valid_attributes
                }

          expect(response).to have_http_status(:success)
          expect(json_response).to include("meta", "data")
          expect(json_response["data"]["description"]).to eq(
            "Updated Description"
          )
          expect(
            json_response["data"]["requirement_template_sections"].first["name"]
          ).to eq("Updated Section")

          requirement_template.reload
          expect(requirement_template.description).to eq("Updated Description")
          expect(
            requirement_template.requirement_template_sections.first.name
          ).to eq("Updated Section")
        end
      end
    end

    context "when the user is not authenticated" do
      it "denies access and returns a forbidden response" do
        patch :update,
              params: {
                id: requirement_template.id,
                requirement_template: valid_attributes
              }
        expect(response).to have_http_status(:unauthorized)

        expect(response.body).to eq(
          "You need to sign in or sign up before continuing."
        )

        requirement_template.reload
        expect(requirement_template.description).to eq("Original Description")
      end
    end

    context "when the user is authenticated but not authorized" do
      let(:regular_user) { create(:user, :submitter) }

      before { sign_in regular_user }

      it "denies access and returns a forbidden response" do
        patch :update,
              params: {
                id: requirement_template.id,
                requirement_template: valid_attributes
              }

        expect(response).to have_http_status(:forbidden)
        expect(json_response["meta"]["message"]["message"]).to eq(
          "The user is not authorized to do this action"
        )

        requirement_template.reload
        expect(requirement_template.description).to eq("Original Description")
      end
    end
  end

  describe "POST #force_publish_now" do
    let(:requirement_template) do
      create(:live_full_requirement_template, sections_count: 1)
    end
    let!(:draft_version) do
      TemplateVersioningService.create_draft!(requirement_template)
    end

    before { sign_in super_admin }

    around do |example|
      original = ENV["ENABLE_TEMPLATE_FORCE_PUBLISH"]
      ENV["ENABLE_TEMPLATE_FORCE_PUBLISH"] = "true"
      example.run
    ensure
      ENV["ENABLE_TEMPLATE_FORCE_PUBLISH"] = original
    end

    it "includes draft_template_versions for super admins" do
      post :force_publish_now,
           params: {
             id: requirement_template.id,
             requirement_template: {
               description: requirement_template.description,
               nickname: requirement_template.nickname
             }
           }

      expect(response).to have_http_status(:success)
      expect(
        json_response.dig("data", "draft_template_versions").pluck("id")
      ).to include(draft_version.id)
    end
  end

  describe "POST #create_draft" do
    let(:requirement_template) do
      create(:live_requirement_template_with_sections)
    end
    let(:config_errors) do
      [
        {
          category: "data_validation",
          block_id: "block-id",
          block_name: "Details",
          requirement_id: "requirement-id",
          requirement_code: "project_value",
          requirement_name: "Project value",
          message: "data validation must have operation and value"
        }
      ]
    end

    before do
      sign_in super_admin
      allow(TemplateVersioningService).to receive(:create_draft!).and_raise(
        TemplateVersionConfigError.new(config_errors)
      )
    end

    it "returns structured configuration errors without a flash message" do
      post :create_draft, params: { id: requirement_template.id }

      expect(response).to have_http_status(:bad_request)
      expect(json_response.dig("meta", "config_errors")).to eq(
        config_errors.map(&:deep_stringify_keys)
      )
      expect(json_response.dig("meta", "message")).to be_nil
    end
  end

  describe "POST #validate_config" do
    let(:requirement_template) do
      create(:live_requirement_template_with_sections)
    end
    let(:config_errors) do
      [
        {
          category: "data_validation",
          block_id: "block-id",
          block_name: "Details",
          requirement_id: "requirement-id",
          requirement_code: "project_value",
          requirement_name: "Project value",
          message: "data validation must have operation and value"
        }
      ]
    end

    before { sign_in super_admin }

    it "returns an empty config_errors list when valid" do
      allow(TemplateVersioningService).to receive(
        :validate_requirement_template!
      )

      post :validate_config, params: { id: requirement_template.id }

      expect(response).to have_http_status(:success)
      expect(json_response.dig("meta", "config_errors")).to eq([])
    end

    it "returns structured configuration errors without a flash message" do
      allow(TemplateVersioningService).to receive(
        :validate_requirement_template!
      ).and_raise(TemplateVersionConfigError.new(config_errors))

      post :validate_config, params: { id: requirement_template.id }

      expect(response).to have_http_status(:bad_request)
      expect(json_response.dig("meta", "config_errors")).to eq(
        config_errors.map(&:deep_stringify_keys)
      )
      expect(json_response.dig("meta", "message")).to be_nil
    end
  end

  describe "GET #for_filter" do
    let(:jurisdiction) { create(:sub_district) }
    let(:other_jurisdiction) { create(:sub_district) }
    let(:submitter) { create(:user, :submitter) }

    let!(:inbox_template) do
      create(:requirement_template, nickname: "Plumbing permit")
    end
    let!(:draft_only_template) do
      create(:requirement_template, nickname: "Draft only permit")
    end
    let!(:other_jurisdiction_template) do
      create(:requirement_template, nickname: "Other city permit")
    end
    let!(:unused_published_template) do
      create(:requirement_template, nickname: "Unused published permit")
    end

    let!(:inbox_version) do
      create(
        :template_version,
        requirement_template: inbox_template,
        status: :published
      )
    end
    let!(:draft_version) do
      create(
        :template_version,
        requirement_template: draft_only_template,
        status: :published
      )
    end
    let!(:other_version) do
      create(
        :template_version,
        requirement_template: other_jurisdiction_template,
        status: :published
      )
    end
    let!(:unused_version) do
      create(
        :template_version,
        requirement_template: unused_published_template,
        status: :published
      )
    end

    let!(:inbox_project) do
      create(:permit_project, jurisdiction: jurisdiction, owner: submitter)
    end

    before do
      create(
        :permit_application,
        status: :newly_submitted,
        submitter: submitter,
        permit_project: inbox_project,
        template_version: inbox_version
      )
      create(
        :permit_application,
        status: :new_draft,
        submitter: submitter,
        permit_project: inbox_project,
        template_version: draft_version
      )
      create(
        :permit_application,
        status: :newly_submitted,
        submitter: submitter,
        permit_project:
          create(
            :permit_project,
            jurisdiction: other_jurisdiction,
            owner: submitter
          ),
        template_version: other_version
      )
    end

    def option_labels
      json_response["data"].map { |option| option["label"] }
    end

    it "returns only templates on the current user's applications when unscoped" do
      sign_in submitter
      get :for_filter

      expect(response).to have_http_status(:success)
      expect(option_labels).to contain_exactly(
        "Plumbing permit",
        "Draft only permit",
        "Other city permit"
      )
    end

    it "returns only templates on a submitter's project, including drafts" do
      sign_in submitter
      get :for_filter, params: { permit_project_id: inbox_project.id }

      expect(response).to have_http_status(:success)
      expect(option_labels).to contain_exactly(
        "Plumbing permit",
        "Draft only permit"
      )
    end
  end
end
