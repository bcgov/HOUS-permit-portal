require "rails_helper"

RSpec.describe PermitApplication, type: :model do
  describe "associations" do
    it { should belong_to(:submitter).class_name("User") }
    it { should belong_to(:local_jurisdiction) }
  end

  describe "enums" do
    xit { should define_enum_for(:permit_type).with_values(residential: 0) }
  end

  describe "validations" do
    context "with an invalid submitter" do
      let(:submitter) { create(:user, role: :reviewer) }
      let(:permit_application) { build(:permit_application, submitter: submitter) }

      it "is not valid" do
        expect(permit_application).not_to be_valid
        expect(permit_application.errors[:submitter]).to include("must have the submitter role")
      end
    end
  end
end
