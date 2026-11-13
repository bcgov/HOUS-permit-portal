require "rails_helper"

RSpec.describe Api::ExplainersController, type: :controller do
  let(:template) { create(:requirement_template) }
  let(:super_admin) { create(:user, :super_admin) }

  describe "GET #show" do
    it "prevents anonymous users from reading a missing explainer" do
      get :show, params: { requirement_template_id: template.id }, format: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "prevents anonymous users from reading a draft explainer" do
      create(
        :explainer,
        requirement_template: template,
        introduction_html: "<p>Draft only</p>"
      )

      get :show, params: { requirement_template_id: template.id }, format: :json

      expect(response).to have_http_status(:forbidden)
      expect(response.body).not_to include("Draft only")
    end

    it "allows anonymous users to read a published explainer" do
      explainer = create(:explainer, :published, requirement_template: template)

      get :show, params: { requirement_template_id: template.id }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(explainer.id)
      expect(json_response.dig("meta", "permit", "id")).to eq(template.id)
      expect(json_response.dig("meta", "permit", "nickname")).to eq(
        template.nickname
      )
      expect(json_response.dig("meta", "related_template_options")).to be_nil
      expect(json_response.dig("meta", "jurisdiction_explainers")).to be_nil
    end

    it "includes download urls for published explainer documents" do
      explainer = create(:explainer, :published, requirement_template: template)
      explainer.documents.create!(file: TestData.cached_file_data)
      allow_any_instance_of(ExplainerDocument).to receive(:file_url_safe).with(
        disposition: "inline"
      ).and_return("https://example.com/open.pdf")
      allow_any_instance_of(ExplainerDocument).to receive(:file_url_safe).with(
        disposition: "attachment"
      ).and_return("https://example.com/download.pdf")

      get :show, params: { requirement_template_id: template.id }, format: :json

      document = json_response.dig("data", "documents").first
      expect(document["file_url"]).to eq("https://example.com/open.pdf")
      expect(document["download_url"]).to eq("https://example.com/download.pdf")
    end

    it "includes related permits that have a published explainer" do
      related = create(:requirement_template, nickname: "Plumbing permit")
      create(
        :template_version,
        requirement_template: related,
        status: :published
      )
      create(:explainer, :published, requirement_template: related)
      unpublished_related =
        create(:requirement_template, nickname: "Gas permit")
      create(
        :template_version,
        requirement_template: unpublished_related,
        status: :published
      )
      explainer = create(:explainer, :published, requirement_template: template)
      explainer.related_template_ids = [related.id, unpublished_related.id]
      explainer.save!

      get :show, params: { requirement_template_id: template.id }, format: :json

      expect(json_response.dig("meta", "related_permits").pluck("id")).to eq(
        [related.id]
      )
      expect(
        json_response.dig("meta", "related_permits").first["nickname"]
      ).to eq("Plumbing permit")
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
      expect(json_response.dig("meta", "related_template_options")).to be_nil
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
