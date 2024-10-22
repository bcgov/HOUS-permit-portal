require "rails_helper"

RSpec.describe Api::ContactsController, type: :controller do
  let(:jurisdiction) { create(:sub_district) }
  let(:super_admin) { create(:user, :super_admin) }
  let!(:review_managers) do
    create_list(:user, 5, :review_manager, jurisdiction: jurisdiction)
  end
  let(:submitter) { create(:user, :submitter) }
  let(:other_submitter) { create(:user, :submitter) }
  let!(:contacts) do
    create_list(:contact, 5, contactable: submitter, first_name: "searchme")
  end
  let!(:other_contacts) do
    create_list(
      :contact,
      5,
      contactable: other_submitter,
      first_name: "searchme"
    )
  end
  let!(:jurisdiction_contacts) do
    create_list(:contact, 5, contactable: jurisdiction, first_name: "searchme")
  end

  before do
    sign_in submitter
    Contact.reindex
  end

  describe "GET #contact_options" do
    context "It only returns the current users contacts as options" do
      it "returns a successful response with the correct data structure" do
        get :contact_options, params: { query: "searchme" }
        expect(response).to have_http_status(:success)
        expect(json_response).to include("meta", "data")

        expect(
          json_response["data"].map { |opt| opt["value"] }.pluck("id")
        ).to match_array(contacts.pluck(:id))
      end
    end
  end

  describe "POST #create" do
    context "It only returns the created contact only to the correct user" do
      it "returns a successful response with the correct data structure" do
        post :create,
             params: {
               contact: {
                 first_name: "searchme",
                 last_name: "totest"
               }
             }
        expect(response).to have_http_status(:success)
        expect(json_response).to include("meta", "data")
        expect(json_response["data"]["first_name"]).to eq("searchme")

        Contact.reindex
        sign_in other_submitter
        get :contact_options, params: { query: "searchme" }
        expect(
          json_response["data"].map { |opt| opt["value"] }.pluck("id")
        ).to match_array(other_contacts.pluck(:id))
      end
    end
  end
end
