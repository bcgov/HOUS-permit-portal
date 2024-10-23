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
               resubmitted: 4
             )
    end
  end

  describe "Scopes" do
    # Create sandboxed and non-sandboxed permit applications
    let!(:jurisdiction) { create(:sub_district) }
    let!(:sandbox) { create(:sandbox, jurisdiction: jurisdiction) }
    let!(:sandboxed_application) do
      create(:permit_application, sandbox: sandbox)
    end
    let!(:live_application) { create(:permit_application) }

    describe ".all" do
      it "returns only non-sandboxed permit applications due to live scope" do
        expect(PermitApplication.live).to include(live_application)
        expect(PermitApplication.live).not_to include(sandboxed_application)
      end
    end

    describe ".sandboxed" do
      it "returns only sandboxed permit applications" do
        expect(PermitApplication.sandboxed).to include(sandboxed_application)
        expect(PermitApplication.sandboxed).not_to include(live_application)
      end
    end

    describe ".live" do
      it "returns only non-sandboxed permit applications" do
        expect(PermitApplication.live).to include(live_application)
        expect(PermitApplication.live).not_to include(sandboxed_application)
      end
    end

    describe "Default Scope" do
      it "includes all permit applications" do
        expect(PermitApplication.all).to include(sandboxed_application)
        expect(PermitApplication.all).to include(live_application)
      end
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
