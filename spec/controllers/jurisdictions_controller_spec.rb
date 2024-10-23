require "rails_helper"

RSpec.describe Api::JurisdictionsController, type: :controller do
  let(:jurisdiction) { create(:sub_district) }
  let(:super_admin) { create(:user, :super_admin) }
  let!(:review_managers) do
    create_list(:user, 5, :review_manager, jurisdiction: jurisdiction)
  end
  let!(:discarded_review_managers) do
    create_list(:user, 5, :review_manager, jurisdiction: jurisdiction).each(
      &:discard
    )
  end
  let!(:reviewers) do
    create_list(:user, 5, :reviewer, jurisdiction: jurisdiction)
  end

  before do
    sign_in super_admin
    User.reindex
  end

  describe "POST #search_users" do
    context "It only returns review_managers and not reviewers" do
      it "returns a successful response with the correct data structure" do
        get :search_users,
            params: {
              id: jurisdiction.id,
              query: "",
              page: 1,
              per_page: 10
            }
        expect(response).to have_http_status(:success)
        expect(json_response).to include("meta", "data")

        expect(json_response["data"].pluck("id")).to match_array(
          review_managers.pluck(:id)
        )
      end
    end

    context "when all users are discarded" do
      it "does not return discarded users if show_archived is not present" do
        post :search_users, params: { id: jurisdiction.id, query: "" }
        expect(json_response["data"].pluck("id")).to match_array(
          review_managers.pluck(:id)
        )
      end

      it "returns discarded users if show_archived is present" do
        post :search_users,
             params: {
               id: jurisdiction.id,
               query: "",
               show_archived: true
             }
        expect(json_response["data"].pluck("id")).to match_array(
          discarded_review_managers.pluck(:id)
        )
      end
    end
  end
end
