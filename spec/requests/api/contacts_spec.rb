require "rails_helper"

RSpec.describe "Api::Contacts", type: :request, search: true do
  include Devise::Test::IntegrationHelpers

  let(:headers) { { "ACCEPT" => "application/json" } }
  let(:user) { create(:user, :submitter) }
  let(:other_user) { create(:user, :submitter) }
  let!(:contact) { create(:contact, contactable: user, first_name: "Alex") }

  before do
    sign_in user
    Contact.reindex
  end

  describe "GET /api/contacts/contact_options" do
    it "returns contact options for the current user" do
      get "/api/contacts/contact_options",
          params: {
            query: "Alex"
          },
          headers: headers,
          as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].first).to include("label", "value")
    end
  end

  describe "POST /api/contacts" do
    it "creates a contact owned by the current user" do
      post "/api/contacts",
           params: {
             contact: {
               first_name: "Pat",
               last_name: "Lee",
               email: "pat@example.com",
               contactable_id: other_user.id
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(Contact.last.contactable_id).to eq(user.id)
    end

    it "returns validation errors for invalid emails" do
      post "/api/contacts",
           params: {
             contact: {
               first_name: "Bad",
               last_name: "Email",
               email: "not-an-email"
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:bad_request)
      expect(json_response.dig("meta", "message", "message")).to be_present
    end
  end

  describe "PATCH /api/contacts/:id" do
    it "updates a contact for the owner" do
      patch "/api/contacts/#{contact.id}",
            params: {
              contact: {
                first_name: "Updated"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "first_name")).to eq("Updated")
    end

    it "forbids updates for other users" do
      sign_in other_user

      patch "/api/contacts/#{contact.id}",
            params: {
              contact: {
                first_name: "Nope"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "DELETE /api/contacts/:id" do
    it "destroys a contact for the owner" do
      delete "/api/contacts/#{contact.id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(Contact.exists?(contact.id)).to be(false)
    end
  end
end
