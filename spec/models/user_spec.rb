require "rails_helper"

RSpec.describe User, type: :model do
  describe "associations" do
    # Testing associations
    it { should have_many(:permit_applications) }
    it { should have_many(:applied_jurisdictions).through(:permit_applications).source(:local_jurisdiction) }

    # Testing optional belongs_to association
    it { should belong_to(:local_jurisdiction).optional }
  end

  describe "enums" do
    # Testing enum for role
    it { should define_enum_for(:role).with_values(submitter: 0, review_manager: 1, reviewer: 2, super_admin: 3) }

    # Testing default value for role
    it "has submitter as a default role" do
      user = User.new
      expect(user.role).to eq("submitter")
    end
  end

  describe "validations" do
    context "local_jurisdiction with invalid role" do
      let(:user) { build(:user, role: :submitter, local_jurisdiction: build(:local_jurisdiction)) }

      it "is not valid" do
        expect(user).not_to be_valid
        expect(user.errors[:local_jurisdiction]).to include(
          "Cannot be present when user is not a reviewer or review manager",
        )
      end
    end
  end
end
