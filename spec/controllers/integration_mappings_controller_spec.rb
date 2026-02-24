require "rails_helper"

RSpec.describe Api::IntegrationMappingsController, type: :controller do
  let(:jurisdiction) { create(:sub_district, external_api_state: "j_on") }
  let(:template_version) { create(:template_version) }
  let(:integration_mapping) do
    IntegrationMapping.find_or_create_by!(
      jurisdiction: jurisdiction,
      template_version: template_version
    ) { |mapping| mapping.requirements_mapping = {} }
  end
  let(:user) { create(:user, :review_manager, jurisdiction: jurisdiction) }

  before { sign_in user }

  describe "PATCH #update" do
    let(:params) do
      {
        id: integration_mapping.id,
        integration_mapping: {
          simplified_map: {
            "RB-1" => {
              "REQ-1" => "field_a"
            }
          }
        }
      }
    end

    it "renders success when requirements mapping is updated" do
      allow_any_instance_of(IntegrationMapping).to receive(
        :update_requirements_mapping
      ).and_return(true)

      patch :update, params: params, format: :json

      expect(response).to have_http_status(:ok)
    end

    it "renders error when requirements mapping update fails" do
      allow_any_instance_of(IntegrationMapping).to receive(
        :update_requirements_mapping
      ).and_return(false)

      patch :update, params: params, format: :json

      expect(response).to have_http_status(:bad_request)
    end
  end
end
