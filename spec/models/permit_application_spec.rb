require "rails_helper"

RSpec.describe PermitApplication, type: :model do
  describe "associations" do
    it { should belong_to(:submitter).class_name("User") }
    it { should belong_to(:jurisdiction) }
  end

  describe "enums" do
    xit { should define_enum_for(:permit_type).with_values(residential: 0) }
    it { should define_enum_for(:status).with_values(draft: 0, submitted: 1, viewed: 2) }
    it { should define_enum_for(:permit_template).with_values(detatched: 0, semi_detatched: 1, small_appartment: 2) }
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
