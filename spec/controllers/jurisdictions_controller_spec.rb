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

  describe "POST #search_users" do

    before do
      sign_in super_admin
      User.reindex
    end

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

  describe "logged in as super_admin" do

    let!(:review_manager) do
      create(:user, :review_manager, email: "review_manager@example.com", jurisdiction: jurisdiction)
    end
    let!(:regional_review_manager) do
      create(:user, :regional_review_manager, email: "regional_review_manager@example.com", jurisdiction: jurisdiction)
    end

    before do
      sign_in super_admin
    end

    context "searching with review manager email" do
      it "should give me the associtated jurisdictions for the review manager" do
        post :index,
          params: {
              query: "review_manager@example.com",
              page: 1,
              per_page: 10
            }
        expect(response).to have_http_status(:success)
        expect(json_response).to include("meta", "data")

        expect(json_response["data"].pluck("id")).to include(jurisdiction.id)
      end
    end

    context "searching with regional review manager email" do
      it "should give me the associtated jurisdictions for that regional review manager" do
        post :index,
          params: {
              query: "review_manager@example.com",
              page: 1,
              per_page: 10
            }
        expect(response).to have_http_status(:success)
        expect(json_response).to include("meta", "data")

        expect(json_response["data"].pluck("id")).to include(jurisdiction.id)
      end
    end

  end

  describe "Didn't logged in and" do
    before do
    end

    context "searching with review manager email" do
      it "should not give me the associtated jurisdictions for the review manager" do
        post :index,
          params: {
              query: "review_manager@example.com",
              page: 1,
              per_page: 10
            }
        expect(response).to have_http_status(:success)
        expect(json_response).to include("meta", "data")

        expect(json_response["data"].pluck("id")).to_not include(jurisdiction.id)
      end
    end

    context "searching with regional review manager email" do
      it "should not give me the associtated jurisdictions for that regional review manager" do
        post :index,
          params: {
              query: "review_manager@example.com",
              page: 1,
              per_page: 10
            }
        expect(response).to have_http_status(:success)
        expect(json_response).to include("meta", "data")

        expect(json_response["data"].pluck("id")).to_not include(jurisdiction.id)
      end
    end

  end
end
