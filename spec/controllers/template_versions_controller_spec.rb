require "rails_helper"

RSpec.describe Api::TemplateVersionsController, type: :controller do
  let!(:jurisdiction) { create(:sub_district) }
  let!(:review_manager) do
    create(:user, :review_manager, jurisdiction: jurisdiction)
  end

  let!(:non_first_nations_template) do
    create(:live_requirement_template, first_nations: false)
  end
  let!(:non_first_nations_version) do
    create(:template_version, requirement_template: non_first_nations_template)
  end
  let!(:first_nations_template) do
    create(:live_requirement_template, first_nations: true)
  end
  let!(:first_nations_version) do
    create(:template_version, requirement_template: first_nations_template)
  end

  let!(:customization) do
    create(
      :jurisdiction_template_version_customization,
      template_version: non_first_nations_version,
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

  describe "POST #copy_jurisdiction_template_version_customization" do
    context "It copies electives from non-first-nation template version when include_electives is true" do
      it "copies the elective fields" do
        post :copy_jurisdiction_template_version_customization,
             params: {
               jurisdiction_id: jurisdiction.id,
               id: first_nations_version.id,
               from_non_first_nations: true,
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

    context "It copies tips from non-first-nation template version when include_tips is true" do
      it "copies the tips and not the elective fields" do
        # JurisdictionTemplateVersionCustomization.last
        post :copy_jurisdiction_template_version_customization,
             params: {
               jurisdiction_id: jurisdiction.id,
               id: first_nations_version.id,
               from_non_first_nations: true,
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
end
