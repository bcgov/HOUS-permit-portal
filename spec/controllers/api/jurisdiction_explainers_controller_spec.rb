require "rails_helper"

RSpec.describe Api::JurisdictionExplainersController, type: :controller do
  let(:template) { create(:requirement_template) }
  let(:jurisdiction) { create(:sub_district) }
  let(:review_manager) do
    create(:user, :review_manager, jurisdiction: jurisdiction)
  end
  let(:other_jurisdiction) { create(:sub_district) }
  let(:show_params) do
    { requirement_template_id: template.id, jurisdiction_id: jurisdiction.id }
  end

  def publish_explainer!
    create(:explainer, :published, requirement_template: template)
  end

  describe "GET #show" do
    it "returns null when the review manager has not saved local context" do
      publish_explainer!
      sign_in review_manager

      get :show, params: show_params, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to be_nil
    end

    it "returns the review manager's local context" do
      publish_explainer!
      explainer =
        create(
          :jurisdiction_explainer,
          :filled,
          requirement_template: template,
          jurisdiction: jurisdiction
        )
      sign_in review_manager

      get :show, params: show_params, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(explainer.id)
      expect(json_response.dig("data", "local_context_html")).to include(
        "pre-application"
      )
    end

    it "prevents a review manager from reading local context before the page is published" do
      sign_in review_manager

      get :show, params: show_params, format: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "prevents a review manager from reading another jurisdiction" do
      publish_explainer!
      sign_in review_manager

      get :show,
          params: {
            requirement_template_id: template.id,
            jurisdiction_id: other_jurisdiction.id
          },
          format: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH #update" do
    let(:update_params) do
      show_params.merge(
        jurisdiction_explainer: {
          local_context_html: "<p>Bring a site plan</p>"
        }
      )
    end

    it "creates local context for the review manager's jurisdiction" do
      publish_explainer!
      sign_in review_manager

      patch :update, params: update_params, format: :json

      expect(response).to have_http_status(:ok)
      expect(
        JurisdictionExplainer.find_by(
          requirement_template: template,
          jurisdiction: jurisdiction
        ).local_context_html
      ).to include("site plan")
    end

    it "creates local context for a regional review manager of the jurisdiction" do
      publish_explainer!
      sign_in create(
                :user,
                :regional_review_manager,
                jurisdiction: jurisdiction
              )

      patch :update, params: update_params, format: :json

      expect(response).to have_http_status(:ok)
    end

    it "prevents reviewers from updating local context" do
      publish_explainer!
      sign_in create(:user, :reviewer, jurisdiction: jurisdiction)

      patch :update, params: update_params, format: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "prevents a review manager from updating local context before the page is published" do
      sign_in review_manager

      patch :update, params: update_params, format: :json

      expect(response).to have_http_status(:forbidden)
      expect(
        JurisdictionExplainer.where(
          requirement_template: template,
          jurisdiction: jurisdiction
        )
      ).to be_empty
    end

    it "prevents super admins from updating local context" do
      publish_explainer!
      sign_in create(:user, :super_admin)

      patch :update, params: update_params, format: :json

      expect(response).to have_http_status(:forbidden)
      expect(
        JurisdictionExplainer.find_by(
          requirement_template: template,
          jurisdiction: jurisdiction
        )
      ).to be_nil
    end

    it "rejects content over the character limit" do
      publish_explainer!
      sign_in review_manager

      patch :update,
            params: {
              requirement_template_id: template.id,
              jurisdiction_id: jurisdiction.id,
              jurisdiction_explainer: {
                local_context_html: "<p>#{"a" * 4001}</p>"
              }
            },
            format: :json

      expect(response).to have_http_status(:bad_request)
      expect(
        JurisdictionExplainer.where(
          requirement_template: template,
          jurisdiction: jurisdiction
        )
      ).to be_empty
    end
  end
end
