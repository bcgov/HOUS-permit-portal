require "rails_helper"

RSpec.describe User, type: :model do
  describe "associations" do
    # Testing associations
    it { should have_many(:permit_applications) }
    it do
      should have_many(:applied_jurisdictions).through(
               :permit_applications
             ).source(:jurisdiction)
    end

    it { should have_many(:jurisdictions).through(:jurisdiction_memberships) }
  end

  describe "enums" do
    # Testing enum for role
    it do
      should define_enum_for(:role).with_values(
               submitter: 0,
               review_manager: 1,
               reviewer: 2,
               super_admin: 3,
               regional_review_manager: 4
             )
    end

    # Testing default value for role
    it "has submitter as a default role" do
      user = User.new
      expect(user.role).to eq("submitter")
    end
  end

  # describe "validations" do
  #   context "jurisdiction with invalid role" do
  #     let(:user) { build(:user, role: :submitter, jurisdiction: build(:jurisdiction)) }

  #     it "is not valid" do
  #       expect(user).not_to be_valid
  #       expect(user.errors[:jurisdiction]).to include("Cannot be present when user is not a reviewer or review manager")
  #     end
  #   end
  # end

  describe "invitable roles" do
    it "a super admin can invite reviewers, review managers, super admins" do
      inviter = build(:user, :super_admin)
      expect(inviter.invitable_roles).to match_array(
        %w[reviewer review_manager regional_review_manager super_admin]
      )
    end
    it "a review manager can invite reviewers and review managers" do
      inviter = build(:user, :review_manager)
      expect(inviter.invitable_roles).to match_array(
        %w[reviewer review_manager]
      )
    end
    it "a reviewer cannot invite anyone" do
      inviter = build(:user, :reviewer)
      expect(inviter.invitable_roles).to match_array([])
    end
  end
end
