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
end
