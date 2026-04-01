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
    let(:invited_role) { :regional_review_manager }

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
      subject.call
      expect(existing_reviewer.reload.discarded_at).to be_nil
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

  context "when multiple non-submitter users share the same email" do
    let(:email) { "shared@example.com" }
    let(:invited_role) { :regional_review_manager }

    context "and an RM and a super_admin both exist with that email" do
      let!(:existing_reviewer) { create(:user, :review_manager, email:) }
      let!(:existing_super_admin) { create(:user, :super_admin, email:) }

      it "promotes the RM to regional review manager" do
        expect { subject.call }.to change {
          existing_reviewer.reload.regional_review_manager?
        }.to(true)
      end

      it "does not report email_taken" do
        service = subject.call
        expect(service.results[:email_taken]).to be_empty
      end

      it "includes the RM in the invited results" do
        service = subject.call
        expect(service.results[:invited]).to include(existing_reviewer)
      end
    end

    context "and an existing RRM and a super_admin both exist with that email" do
      let!(:existing_reviewer) do
        create(:user, :regional_review_manager, email:)
      end
      let!(:existing_super_admin) { create(:user, :super_admin, email:) }

      it "adds the RRM to the new jurisdiction instead of reporting email_taken" do
        expect { subject.call }.to change {
          existing_reviewer.reload.jurisdictions.count
        }
      end

      it "does not report email_taken" do
        service = subject.call
        expect(service.results[:email_taken]).to be_empty
      end
    end

    context "and only a super_admin exists with that email (no RM)" do
      let!(:existing_super_admin) { create(:user, :super_admin, email:) }

      it "reports email_taken since there is no promotable user" do
        service = subject.call
        expect(service.results[:email_taken]).to include(existing_super_admin)
      end
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
