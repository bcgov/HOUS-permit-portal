require "rails_helper"

RSpec.describe PermitApplication, type: :model do
  describe "associations" do
    subject { build_stubbed(:permit_application) }

    it { should belong_to(:submitter).class_name("User") }
    it { should belong_to(:jurisdiction) }
  end

  describe "enums" do
    subject { build_stubbed(:permit_application) }

    it do
      should define_enum_for(:status).with_values(
               new_draft: 0,
               newly_submitted: 1,
               revisions_requested: 3,
               resubmitted: 4,
             )
    end
  end

  # describe "validations" do
  #   context "with an invalid submitter" do
  #     let(:submitter) { create(:user, role: :reviewer) }
  #     let(:permit_application) { build(:permit_application, submitter: submitter) }

  #     it "is not valid" do
  #       expect(permit_application).not_to be_valid
  #       expect(permit_application.errors[:submitter]).to include("must have the submitter role")
  #     end
  #   end
  # end
end
