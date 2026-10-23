require "rails_helper"

RSpec.describe Api::ExplainersController, type: :controller do
  let(:template) { create(:requirement_template) }
  let(:super_admin) { create(:user, :super_admin) }

  describe "GET #show" do
    it "prevents anonymous users from reading the explainer" do
      get :show, params: { requirement_template_id: template.id }, format: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it "prevents non-super admins from reading the explainer" do
      sign_in create(:user)

      get :show, params: { requirement_template_id: template.id }, format: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "allows review managers to read a published explainer" do
      explainer = create(:explainer, :published, requirement_template: template)
      sign_in create(:user, :review_manager)

      get :show, params: { requirement_template_id: template.id }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(explainer.id)
      expect(json_response.dig("meta", "jurisdiction_explainers")).to be_nil
    end

    it "hides a draft explainer from review managers" do
      create(
        :explainer,
        requirement_template: template,
        introduction_html: "<p>Draft only</p>"
      )
      sign_in create(:user, :review_manager)

      get :show, params: { requirement_template_id: template.id }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to be_nil
      expect(response.body).not_to include("Draft only")
      expect(json_response.dig("meta", "related_template_options")).to be_nil
    end

    it "includes filled jurisdiction explainers for super admins" do
      filled_jurisdiction = create(:sub_district, name: "Alpha")
      create(
        :jurisdiction_explainer,
        :filled,
        requirement_template: template,
        jurisdiction: filled_jurisdiction
      )
      create(
        :jurisdiction_explainer,
        requirement_template: template,
        jurisdiction: create(:sub_district)
      )
      sign_in super_admin

      get :show, params: { requirement_template_id: template.id }, format: :json

      expect(
        json_response.dig("meta", "jurisdiction_explainers").pluck(
          "jurisdiction_id"
        )
      ).to eq([filled_jurisdiction.id])
    end

    it "returns null data when the explainer has not been created" do
      sign_in super_admin

      get :show, params: { requirement_template_id: template.id }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to be_nil
    end

    it "returns the explainer and related published template options" do
      explainer = create(:explainer, :published, requirement_template: template)
      other = create(:requirement_template, nickname: "Plumbing permit")
      create(:template_version, requirement_template: other, status: :published)
      create(:requirement_template, nickname: "Hidden")
      sign_in super_admin

      get :show, params: { requirement_template_id: template.id }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(explainer.id)
      expect(
        json_response.dig("meta", "related_template_options").pluck("value")
      ).to contain_exactly(other.id)
    end
  end

  describe "PATCH #update" do
    it "prevents review managers from saving" do
      sign_in create(:user, :review_manager)

      patch :update,
            params: {
              requirement_template_id: template.id,
              explainer: {
                introduction_html: "<p>When you need this permit</p>"
              }
            },
            format: :json

      expect(response).to have_http_status(:forbidden)
      expect(template.reload.explainer).to be_nil
    end

    it "prevents non-super admins from saving" do
      sign_in create(:user)

      patch :update,
            params: {
              requirement_template_id: template.id,
              explainer: {
                introduction_html: "<p>When you need this permit</p>"
              }
            },
            format: :json

      expect(response).to have_http_status(:forbidden)
      expect(template.reload.explainer).to be_nil
    end

    it "creates, publishes, and returns the explainer" do
      sign_in super_admin

      patch :update,
            params: {
              requirement_template_id: template.id,
              explainer: {
                introduction_html: "<p>When you need this permit</p>",
                publish: true
              }
            },
            format: :json

      expect(response).to have_http_status(:ok)
      explainer = template.reload.explainer
      expect(explainer).to be_published
      expect(json_response.dig("data", "id")).to eq(explainer.id)
      expect(json_response.dig("data", "introduction_html")).to include(
        "When you need this permit"
      )
    end

    it "does not publish when the introduction is blank" do
      sign_in super_admin

      patch :update,
            params: {
              requirement_template_id: template.id,
              explainer: {
                introduction_html: "<p></p>",
                publish: true
              }
            },
            format: :json

      expect(response).to have_http_status(:bad_request)
      expect(template.reload.explainer).to be_nil
    end
  end
end
