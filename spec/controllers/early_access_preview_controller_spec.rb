require "rails_helper"

RSpec.describe Api::EarlyAccessPreviewsController, type: :controller do
  let!(:super_admin) { create(:user, :super_admin) }
  let!(:early_access_preview) { create(:early_access_preview) }
  let!(:discarded_preview) { create(:early_access_preview, :discarded) }

  before { sign_in super_admin }

  describe "POST #revoke_access" do
    context "when the preview is already revoked" do
      it "returns an error message" do
        post :revoke_access, params: { id: discarded_preview.id }

        expect(response).to have_http_status(:bad_request)
        expect(JSON.parse(response.body)["meta"]["message"]["message"]).to eq(
          I18n.t(
            "arbitrary_message_construct.early_access_preview.already_revoked.message"
          )
        )
      end
    end

    context "when the preview is not revoked" do
      it "revokes the preview successfully" do
        post :revoke_access, params: { id: early_access_preview.id }

        expect(response).to have_http_status(:success)
        early_access_preview.reload
        expect(early_access_preview.discarded_at).not_to be_nil
        expect(JSON.parse(response.body)["meta"]["message"]["message"]).to eq(
          I18n.t(
            "arbitrary_message_construct.early_access_preview.revoke_success.message"
          )
        )
      end
    end
  end

  describe "POST #unrevoke" do
    context "when the preview is not revoked" do
      it "returns an error message" do
        post :unrevoke_access, params: { id: early_access_preview.id }

        expect(response).to have_http_status(:bad_request)
        expect(JSON.parse(response.body)["meta"]["message"]["message"]).to eq(
          I18n.t(
            "arbitrary_message_construct.early_access_preview.not_revoked.message"
          )
        )
      end
    end

    context "when the preview is revoked" do
      it "unrevokes the preview successfully" do
        early_access_preview.discard
        post :unrevoke_access, params: { id: early_access_preview.id }

        expect(response).to have_http_status(:success)
        early_access_preview.reload
        expect(early_access_preview.discarded_at).to be_nil
        expect(JSON.parse(response.body)["meta"]["message"]["message"]).to eq(
          I18n.t(
            "arbitrary_message_construct.early_access_preview.unrevoke_success.message"
          )
        )
      end
    end
  end

  describe "POST #extend" do
    it "extends the early access preview successfully" do
      allow(early_access_preview).to receive(:extend_access).and_return(true)
      post :extend_access, params: { id: early_access_preview.id }

      expect(response).to have_http_status(:success)
      expect(JSON.parse(response.body)["meta"]["message"]["message"]).to eq(
        I18n.t(
          "arbitrary_message_construct.early_access_preview.extend_success.message"
        )
      )
    end
  end
end
