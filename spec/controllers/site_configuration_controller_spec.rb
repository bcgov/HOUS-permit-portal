require "rails_helper"

RSpec.describe Api::SiteConfigurationController, type: :controller do
  describe "GET #show" do
    it "returns the singleton site configuration" do
      SiteConfiguration.instance

      get :show, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to be_present
      expect(json_response["data"]).to have_key("info_documents_intro_text")
    end
  end

  describe "PUT #update" do
    let(:super_admin) { create(:user, :super_admin) }

    before do
      sign_in super_admin
      SiteConfiguration.instance
    end

    it "updates site configuration fields for super admins" do
      site_configuration = SiteConfiguration.instance

      put :update,
          params: {
            site_configuration: {
              display_sitewide_message: true,
              sitewide_message: "Maintenance window",
              info_documents_intro_text:
                "Short guides about Building Permit Hub.",
              overheating_tool_enabled: true,
              project_meetings_enabled: true
            }
          },
          format: :json

      expect(response).to have_http_status(:ok)
      expect(SiteConfiguration.instance.display_sitewide_message).to eq(true)
      expect(SiteConfiguration.instance.info_documents_intro_text).to eq(
        "Short guides about Building Permit Hub."
      )
      expect(SiteConfiguration.instance.overheating_tool_enabled).to eq(true)
      expect(SiteConfiguration.instance.project_meetings_enabled).to eq(true)
      audit =
        ApplicationAudit.where(
          auditable_type: "SiteConfiguration",
          auditable_id: site_configuration.id,
          action: "update"
        ).last
      expect(audit.audited_changes["project_meetings_enabled"]).to eq(
        [false, true]
      )
      expect(audit.user).to eq(super_admin)
    end
  end

  describe "PUT #update as a non-super admin" do
    it "prevents non-super admins from updating intro text" do
      SiteConfiguration.instance
      sign_in create(:user)

      put :update,
          params: {
            site_configuration: {
              info_documents_intro_text: "Should not persist."
            }
          },
          format: :json

      expect(response).to have_http_status(:forbidden)
      expect(SiteConfiguration.instance.info_documents_intro_text).not_to eq(
        "Should not persist."
      )
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
