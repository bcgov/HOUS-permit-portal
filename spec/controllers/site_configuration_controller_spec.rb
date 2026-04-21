require "rails_helper"

RSpec.describe Api::SiteConfigurationController, type: :controller do
  describe "GET #show" do
    it "returns the singleton site configuration" do
      SiteConfiguration.instance

      get :show, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to be_present
    end
  end

  describe "PUT #update" do
    let(:super_admin) { create(:user, :super_admin) }

    before do
      sign_in super_admin
      SiteConfiguration.instance
    end

    it "updates site configuration fields for super admins" do
      put :update,
          params: {
            site_configuration: {
              display_sitewide_message: true,
              sitewide_message: "Maintenance window"
            }
          },
          format: :json

      expect(response).to have_http_status(:ok)
      expect(SiteConfiguration.instance.display_sitewide_message).to eq(true)
    end
  end

  describe "POST #update_jurisdiction_enrollments" do
    let(:super_admin) { create(:user, :super_admin) }
    let!(:existing_jurisdiction) { create(:sub_district) }
    let!(:new_jurisdiction) { create(:sub_district) }

    before do
      sign_in super_admin
      create(
        :jurisdiction_service_partner_enrollment,
        jurisdiction: existing_jurisdiction,
        service_partner: :archistar
      )
    end

    it "replaces enrollments for the provided service partner" do
      post :update_jurisdiction_enrollments,
           params: {
             service_partner: "archistar",
             jurisdiction_ids: [new_jurisdiction.id]
           },
           format: :json

      expect(response).to have_http_status(:ok)
      ids =
        JurisdictionServicePartnerEnrollment.where(
          service_partner: :archistar
        ).pluck(:jurisdiction_id)
      expect(ids).to contain_exactly(new_jurisdiction.id)
    end
  end
end
