require "rails_helper"

RSpec.describe Jurisdiction::UserInviter, type: :service do
  let(:email) { "user@test.com" }
  let(:inviter) { build_stubbed(:user, :super_admin) }
  let(:jurisdiction) { create(:sub_district) }
  let(:existing_user_role) { :review_manager }
  let(:invited_role) { :review_manager }
  let(:users_params) do
    [
      {
        email:,
        role: invited_role.to_s,
        first_name: "Some",
        last_name: "User",
        jurisdiction_id: jurisdiction.id
      }
    ]
  end
  subject(:user_inviter) do
    Jurisdiction::UserInviter.new(inviter:, users_params:)
  end

  context "when a reviewer is invited with an email that does not belong to an existing user" do
    it_behaves_like AN_INVITED_USER
  end

  context "when a regional RM is invited with an email that does not belong to an existing user" do
    it_behaves_like AN_INVITED_USER
  end

  context "when an unconfirmed reviewer is re-invited" do
    let!(:existing_reviewer) do
      create(:user, existing_user_role, confirmed: false)
    end
    let(:email) { existing_reviewer.email }

    it_behaves_like A_REINVITED_USER
  end

  context "when a discarded reviewer is re-invited" do
    let!(:existing_reviewer) do
      create(:user, existing_user_role, discarded_at: Time.current - 1.week)
    end
    let(:email) { existing_reviewer.email }

    it_behaves_like A_REINVITED_USER

    it "reactivates the user" do
    end
  end

  context "when a confirmed active review staff user is invited" do
    let!(:existing_reviewer) { create(:user, existing_user_role) }
    let(:email) { existing_reviewer.email }

    it_behaves_like AN_EXISTING_USER

    context "and the invited user is a regional review manager" do
      let(:invited_role) { :regional_review_manager }

      it_behaves_like AN_EXISTING_REGIONAL_RM
      it_behaves_like A_REVIEW_STAFF_INVITED_AS_A_REGIONAL_RM
    end

    context "and the confirmed active review staff is a regional review manager" do
      let(:invited_role) { :regional_review_manager }
      let(:existing_user_role) { :regional_review_manager }

      it_behaves_like AN_EXISTING_REGIONAL_RM
    end
  end

  context "when a user who already exists as a submitter is invited" do
    let!(:submitter) { create(:user, :submitter, email:) }

    it_behaves_like AN_INVITED_USER
    it_behaves_like AN_INVITED_SUBMITTER
  end

  context "when a user is re-invited after creating a submitter account" do
    let!(:submitter) { create(:user, :submitter, email:) }
    let!(:existing_reviewer) do
      create(:user, existing_user_role, confirmed: false)
    end
    let(:email) { existing_reviewer.email }

    it_behaves_like A_REINVITED_USER
    it_behaves_like AN_INVITED_SUBMITTER
  end
end
