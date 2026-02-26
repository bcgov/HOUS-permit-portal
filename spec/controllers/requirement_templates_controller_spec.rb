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
                 ],
                 type: LiveRequirementTemplate.name
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
                   type: LiveRequirementTemplate.name,
                   requirement_template_sections_attributes: [
                     { name: "another section", position: 1 }
                   ]
                 }
               }
        }.not_to change(RequirementTemplate, :count)

        expect(response).to have_http_status(:bad_request)
      end

      it "copies sections from an existing requirement template when providing nickname to copy endpoint" do
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

  describe "POST #invite_previewers" do
    let(:live_requirement_template) { create(:live_requirement_template) }
    let(:early_access_requirement_template) do
      create(:early_access_requirement_template)
    end
    let(:service_instance) do
      instance_double(EarlyAccess::PreviewManagementService)
    end

    before do
      allow(EarlyAccess::PreviewManagementService).to receive(:new).and_return(
        service_instance
      )
      sign_in super_admin
    end

    context "when inviting previewers successfully" do
      let(:previewer_emails) { %w[user1@example.com user2@example.com] }
      let(:previews) do
        [double("EarlyAccessPreview"), double("EarlyAccessPreview")]
      end

      before do
        allow(service_instance).to receive(:invite_previewers!).with(
          previewer_emails
        ).and_return({ previews: previews, failed_emails: [] })
      end

      it "invokes the service with correct parameters and returns success response" do
        post :invite_previewers,
             params: {
               id: early_access_requirement_template.id,
               emails: previewer_emails
             }
        expect(EarlyAccess::PreviewManagementService).to have_received(
          :new
        ).with(early_access_requirement_template)
        expect(service_instance).to have_received(:invite_previewers!).with(
          previewer_emails
        )

        expect(response).to have_http_status(:success)
        expect(json_response).to include("meta", "data")
        expect(json_response["meta"]["message"]["message"]).to include(
          "Successfully invited previewers"
        )
      end
    end

    context "when providing invalid emails" do
      let(:previewer_emails) { %w[invalid_email user2@example.com] }
      let(:failed_emails) do
        [{ email: "invalid_email", error: "Invalid email format" }]
      end

      before do
        allow(service_instance).to receive(:invite_previewers!).with(
          previewer_emails
        ).and_return({ previews: [], failed_emails: failed_emails })
      end

      it "invokes the service and returns an error response with invalid emails" do
        post :invite_previewers,
             params: {
               id: early_access_requirement_template.id,
               emails: previewer_emails
             }
        expect(EarlyAccess::PreviewManagementService).to have_received(
          :new
        ).with(early_access_requirement_template)
        expect(service_instance).to have_received(:invite_previewers!).with(
          previewer_emails
        )

        expect(response).to have_http_status(400)
        expect(json_response["meta"]["message"]["message"]).to include(
          "Previewers could not be invited"
        )
      end
    end

    context "when requirement template is wrong type" do
      it "does not invoke the service and returns a 400 error" do
        post :invite_previewers,
             params: {
               id: live_requirement_template.id,
               emails: ["user@example.com"]
             }

        expect(EarlyAccess::PreviewManagementService).not_to have_received(:new)

        expect(response).to have_http_status(403)
      end
    end

    context "when no previewers are provided" do
      it "does not invoke the service and returns a bad request error" do
        post :invite_previewers,
             params: {
               id: early_access_requirement_template.id,
               emails: []
             }

        expect(EarlyAccess::PreviewManagementService).not_to have_received(:new)

        expect(response).to have_http_status(:bad_request)
        expect(json_response["meta"]["message"]["message"]).to include(
          "Previewers could not be invited"
        )
      end
    end
  end

  # Adding the GET #show tests here
  describe "GET #show" do
    let(:early_access_template) { create(:early_access_requirement_template) }
    let!(:early_access_published_version) do
      early_access_template.published_template_version ||
        create(
          :template_version,
          requirement_template: early_access_template,
          status: :published
        )
    end

    context "when not authenticated" do
      before { sign_out :user }

      it "denies access" do
        get :show, params: { id: early_access_template.id }

        expect(response).to have_http_status(:forbidden)
        expect(json_response["meta"]["message"]["message"]).to eq(
          "The user is not authorized to do this action"
        )
      end
    end

    context "when authenticated as a super admin" do
      let(:super_admin_user) { create(:user, :super_admin) }

      before { sign_in super_admin_user }

      it "allows access" do
        get :show, params: { id: early_access_template.id }

        expect(response).to have_http_status(:ok)
        expect(json_response).to include("meta", "data")
        expect(json_response["data"]["id"]).to eq(early_access_template.id.to_s)
      end
    end

    context "when authenticated as a user with a valid early access preview" do
      let(:user_with_preview) { create(:user, :submitter) }
      let!(:early_access_preview) do
        create(
          :early_access_preview,
          previewer: user_with_preview,
          template_version: early_access_published_version,
          expires_at: 1.day.from_now
        )
      end

      before { sign_in user_with_preview }

      it "allows access" do
        get :show, params: { id: early_access_template.id }

        expect(response).to have_http_status(:ok)
        expect(json_response).to include("meta", "data")
        expect(json_response["data"]["id"]).to eq(early_access_template.id.to_s)
      end
    end

    context "when authenticated as a user without the necessary early access preview" do
      let(:user_without_preview) { create(:user, :submitter) }

      before { sign_in user_without_preview }

      it "denies access" do
        get :show, params: { id: early_access_template.id }
        expect(response).to have_http_status(:forbidden)
        expect(json_response["meta"]["message"]["message"]).to eq(
          "The user is not authorized to do this action"
        )
      end
    end

    context "when authenticated as a user with an expired early access preview" do
      let(:user_with_expired_preview) { create(:user, :submitter) }
      let!(:expired_early_access_preview) do
        create(
          :early_access_preview,
          previewer: user_with_expired_preview,
          template_version: early_access_published_version,
          expires_at: 1.day.ago
        )
      end

      before { sign_in user_with_expired_preview }

      it "denies access" do
        get :show, params: { id: early_access_template.id }

        expect(response).to have_http_status(:forbidden)
        expect(json_response["meta"]["message"]["message"]).to eq(
          "The user is not authorized to do this action"
        )
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

      context "when updating an early access requirement template" do
        let(:early_access_template) do
          create(
            :early_access_requirement_template,
            description: "Early Access Original"
          )
        end

        let(:early_access_attributes) do
          { nickname: "Early Access Updated Nickname" }
        end

        it "reloads the requirement template after update" do
          patch :update,
                params: {
                  id: early_access_template.id,
                  requirement_template: early_access_attributes
                }

          expect(response).to have_http_status(:success)
          expect(json_response["data"]["nickname"]).to eq(
            "Early Access Updated Nickname"
          )

          early_access_template.reload
          expect(early_access_template.nickname).to eq(
            "Early Access Updated Nickname"
          )
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
end
