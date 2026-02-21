require "rails_helper"

RSpec.describe "Api::PermitTypeSubmissionContacts", type: :request do
  let(:contact) do
    create(
      :permit_type_submission_contact,
      jurisdiction: create(:sub_district),
      confirmed_at: nil,
      confirmation_token: "token-123"
    )
  end

  it "confirms the submission contact and redirects" do
    get "/api/permit_type_submission_contacts/confirm",
        params: {
          confirmation_token: contact.confirmation_token
        }

    expect(response).to have_http_status(:found)
    expect(response.headers["Location"]).to include("/confirmed")
    expect(contact.reload).to be_confirmed
  end
end
