# spec/controllers/api/requirement_templates_controller_spec.rb
require "rails_helper"

RSpec.describe Api::RequirementTemplatesController, type: :controller do
  let!(:super_admin) { create(:user, :super_admin) }
  let!(:activity) { create(:activity) }
  let!(:permit_type) { create(:permit_type, code: :high_residential) }
  let!(:other_activity) { create(:activity, code: :demolition) }
  let!(:other_permit_type) { create(:permit_type) }

  # Move the sign_in into specific contexts to avoid affecting all tests
  # before { sign_in super_admin }

  describe "POST #create" do
    before { sign_in super_admin }

    context "It creates a live requirement template" do
      it "returns a successful response with the correct data structure" do
        post :create,
             params: {
               requirement_template: {
                 description: "a template of some description",
                 first_nations: false,
                 activity_id: activity.id,
                 permit_type_id: permit_type.id,
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

      it "does not create a requirement template when an existing template has the same combination of permit type and activity" do
        create(
          :live_requirement_template,
          activity: activity,
          permit_type: permit_type
        )

        expect {
          post :create,
               params: {
                 requirement_template: {
                   description: "a new template",
                   first_nations: false,
                   activity_id: activity.id,
                   permit_type_id: permit_type.id,
                   type: LiveRequirementTemplate.name,
                   requirement_template_sections_attributes: [
                     { name: "another section", position: 1 }
                   ]
                 }
               }
        }.not_to change(RequirementTemplate, :count)

        expect(response).to have_http_status(:bad_request)
        expect(json_response["meta"]["message"]).to include(
          "message" =>
            "There can only be one requirement template per permit type, activity, and First Nations combination",
          "title" => "Error",
          "type" => "error"
        )
      end

      it "creates a requirement template when the activity and permit type are the same, but first nations is true" do
        create(
          :live_requirement_template,
          activity: activity,
          permit_type: permit_type,
          first_nations: false
        )

        expect {
          post :create,
               params: {
                 requirement_template: {
                   description: "a new template with first nations",
                   first_nations: true,
                   activity_id: activity.id,
                   permit_type_id: permit_type.id,
                   requirement_template_sections_attributes: [
                     { name: "another section", position: 1 }
                   ]
                 }
               }
        }.to change(RequirementTemplate, :count).by(1)

        expect(response).to have_http_status(:success)
        expect(json_response).to include("meta", "data")
        expect(json_response["data"]["description"]).to eq(
          "a new template with first nations"
        )
      end

      it "copies sections from an existing non-first-nation requirement template when providing classifications to copy endpoint" do
        create(
          :live_requirement_template,
          activity: activity,
          permit_type: permit_type,
          first_nations: false,
          requirement_template_sections_attributes: [
            { name: "existing section one", position: 1 },
            { name: "existing section two", position: 2 }
          ]
        )

        expect {
          post :copy,
               params: {
                 requirement_template: {
                   description: "a copied template with first nations",
                   activity_id: activity.id,
                   permit_type_id: permit_type.id,
                   first_nations: true
                 }
               }
        }.to change(RequirementTemplate, :count).by(1)

        expect(response).to have_http_status(:success)
        new_template = RequirementTemplate.order(created_at: :asc).last
        # For some reason this spec is prone to failing on GitHub Action
        expect(new_template.description).to eq(
          "a copied template with first nations"
        )
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
    let(:live_requirement_template) do
      create(
        :live_requirement_template,
        first_nations: false,
        activity: activity,
        permit_type: permit_type
      )
    end
    let(:early_access_requirement_template) do
      create(
        :early_access_requirement_template,
        first_nations: false,
        activity: activity,
        permit_type: permit_type
      )
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
    let(:public_template) do
      create(:early_access_requirement_template, public: true)
    end
    let(:private_template) do
      create(:early_access_requirement_template, public: false)
    end

    context "when the requirement template is public" do
      it "allows access without authentication" do
        get :show, params: { id: public_template.id }

        expect(response).to have_http_status(:ok)
        expect(json_response).to include("meta", "data")
        expect(json_response["data"]["id"]).to eq(public_template.id.to_s)
      end
    end

    context "when the requirement template is not public" do
      context "when not authenticated" do
        # Ensure no user is signed in
        before { sign_out :user }

        it "denies access" do
          get :show, params: { id: private_template.id }

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
          get :show, params: { id: private_template.id }

          expect(response).to have_http_status(:ok)
          expect(json_response).to include("meta", "data")
          expect(json_response["data"]["id"]).to eq(private_template.id.to_s)
        end
      end

      context "when authenticated as a user with a valid early access preview" do
        let(:user_with_preview) { create(:user, :submitter) }
        let!(:early_access_preview) do
          create(
            :early_access_preview,
            previewer: user_with_preview,
            early_access_requirement_template: private_template,
            expires_at: 1.day.from_now
          )
        end

        before { sign_in user_with_preview }

        it "allows access" do
          get :show, params: { id: private_template.id }

          expect(response).to have_http_status(:ok)
          expect(json_response).to include("meta", "data")
          expect(json_response["data"]["id"]).to eq(private_template.id.to_s)
        end
      end

      context "when authenticated as a user without the necessary early access preview" do
        let(:user_without_preview) { create(:user, :submitter) }

        before { sign_in user_without_preview }

        it "denies access" do
          get :show, params: { id: private_template.id }
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
            early_access_requirement_template: private_template,
            expires_at: 1.day.ago
          )
        end

        before { sign_in user_with_expired_preview }

        it "denies access" do
          get :show, params: { id: private_template.id }

          expect(response).to have_http_status(:forbidden)
          expect(json_response["meta"]["message"]["message"]).to eq(
            "The user is not authorized to do this action"
          )
        end
      end
    end
  end

  describe "PATCH #update" do
    let(:requirement_template) do
      create(
        :live_requirement_template_with_sections,
        description: "Original Description",
        first_nations: false,
        activity: activity,
        permit_type: permit_type
      )
    end

    let(:valid_attributes) do
      {
        description: "Updated Description",
        first_nations: true,
        activity_id: other_activity.id,
        permit_type_id: other_permit_type.id,
        requirement_template_sections_attributes: [
          {
            id: requirement_template.requirement_template_sections.first.id,
            name: "Updated Section",
            position: 1
          }
        ]
      }
    end

    let(:invalid_attributes) { { activity_id: nil, permit_type_id: nil } }

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
          expect(json_response["data"]["first_nations"]).to be_truthy
          expect(json_response["data"]["activity"]["id"]).to eq(
            other_activity.id
          )
          expect(json_response["data"]["permit_type"]["id"]).to eq(
            other_permit_type.id
          )
          expect(
            json_response["data"]["requirement_template_sections"].first["name"]
          ).to eq("Updated Section")

          # Verify that the changes are persisted in the database
          requirement_template.reload
          expect(requirement_template.description).to eq("Updated Description")
          expect(requirement_template.first_nations).to be_truthy
          expect(requirement_template.activity_id).to eq(other_activity.id)
          expect(requirement_template.permit_type_id).to eq(
            other_permit_type.id
          )
          expect(
            requirement_template.requirement_template_sections.first.name
          ).to eq("Updated Section")
        end
      end

      context "with invalid parameters" do
        it "does not update the requirement template and returns an error response" do
          patch :update,
                params: {
                  id: requirement_template.id,
                  requirement_template: invalid_attributes
                }

          expect(response).to have_http_status(:bad_request)
          expect(json_response["meta"]["message"]["message"]).to eq(
            "Activity must exist, Permit type must exist"
          )

          # Ensure that the description was not updated
          requirement_template.reload
          expect(requirement_template.description).to eq("Original Description")
        end
      end

      context "when updating an early access requirement template" do
        let(:early_access_template) do
          create(
            :early_access_requirement_template,
            description: "Early Access Original",
            first_nations: false,
            activity: activity,
            permit_type: permit_type
          )
        end

        let(:early_access_attributes) do
          { nickname: "Early Access Updated Nickname", first_nations: true }
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

          # Verify that the template is reloaded and changes are persisted
          early_access_template.reload
          expect(early_access_template.nickname).to eq(
            "Early Access Updated Nickname"
          )
          expect(early_access_template.first_nations).to be_truthy
        end
      end
    end

    context "when the user is not authenticated" do
      # before { sign_out :user }

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

        # Ensure that the description was not updated
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

        # Ensure that the description was not updated
        requirement_template.reload
        expect(requirement_template.description).to eq("Original Description")
      end
    end
  end
end
