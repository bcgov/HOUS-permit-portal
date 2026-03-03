require "rails_helper"

RSpec.describe Api::EndUserLicenseAgreementController, type: :controller do
  let(:user) { create(:user, :submitter) }

  before { sign_in user }

  describe "GET #index" do
    it "returns the active agreement for the current user's eula variant" do
      agreement =
        EndUserLicenseAgreement.create!(
          content: "<p>Agreement</p>",
          active: true,
          variant: :open
        )

      get :index, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]["id"]).to eq(agreement.id)
    end
  end
end
