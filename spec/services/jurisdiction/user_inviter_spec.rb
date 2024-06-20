require "rails_helper"

RSpec.describe Jurisdiction::UserInviter, type: :service do
  let(:email) { "user@test.com" }
  let(:inviter) { build_stubbed(:user, :super_admin) }
  let(:jurisdiction) { create(:sub_district) }
  let(:role) { "review_manager" }
  let(:users_params) { [{ email:, role:, first_name: "Some", last_name: "User", jurisdiction_id: jurisdiction.id }] }
  subject(:user_inviter) { Jurisdiction::UserInviter.new(inviter:, users_params:) }

  context "when a reviewer is invited with an email that does not belong to an existing user" do
    it_behaves_like AN_INVITED_USER
  end

  context "when an unconfirmed reviewer is re-invited" do
    let!(:existing_reviewer) { create(:user, role, confirmed: false) }
    let(:email) { existing_reviewer.email }

    it_behaves_like A_REINVITED_USER
  end

  context "when a discarded reviewer is re-invited" do
    let!(:existing_reviewer) { create(:user, role, discarded_at: Time.current - 1.week) }
    let(:email) { existing_reviewer.email }

    it_behaves_like A_REINVITED_USER

    it "reactivates the user" do
    end
  end

  context "when a confirmed active review staff user is invited" do
    let!(:existing_reviewer) { create(:user, role) }
    let(:email) { existing_reviewer.email }

    it_behaves_like AN_EXISTING_USER
  end

  context "when a user who already exists as a submitter is invited" do
    let!(:submitter) { create(:user, :submitter, email:) }

    it_behaves_like AN_INVITED_USER
    it_behaves_like AN_INVITED_SUBMITTER
  end

  context "when a user is re-invited after creating a submitter account" do
    let!(:submitter) { create(:user, :submitter, email:) }
    let!(:existing_reviewer) { create(:user, role, confirmed: false) }
    let(:email) { existing_reviewer.email }

    before :each do
      # Update UUIDs so the submitter is retrieved first
      submitter.update_column(:id, "aa99da14-89bc-475b-bfb3-cfd925655339")
      existing_reviewer.update_column(:id, "abb9760b-8fbb-4b1a-aa16-b65830816060")
    end

    it_behaves_like A_REINVITED_USER
    it_behaves_like AN_INVITED_SUBMITTER
  end
end
