require "rails_helper"

RSpec.describe Api::RequirementTemplatesController, type: :controller do
  let(:super_admin) { create(:user, :super_admin) }
  let(:activity) { create(:activity) }
  let(:permit_type) { create(:permit_type) }
  let(:other_activity) { create(:activity) }
  let(:other_permit_type) { create(:permit_type) }

  before { sign_in super_admin }

  describe "POST #create" do
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

      it "does not create a requirement template when an exisitng template has the same combination of permit type and activity" do
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
        # For some reason this spec is prone to failing on github action
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
end
