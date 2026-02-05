require "rails_helper"

RSpec.describe PreCheck, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:creator).class_name("User").optional }
    it { is_expected.to belong_to(:permit_application).optional }
    it { is_expected.to have_one(:permit_project).through(:permit_application) }
  end

  describe "validations" do
    it "ensures checklist defaults to sections array when blank" do
      pre_check = build(:pre_check)

      expect(pre_check).to be_valid
    end

    it "does not allow linking to a permit application the creator does not own" do
      permit_application = create(:permit_application)
      other_user = create(:user)

      pre_check =
        build(
          :pre_check,
          creator: other_user,
          permit_application: permit_application
        )

      expect(pre_check).not_to be_valid
      expect(pre_check.errors[:permit_application]).to include("is invalid")
    end
  end

  describe "search_data" do
    it "includes searchable attributes" do
      creator = create(:user)
      permit_project = create(:permit_project, title: "Delegated Title")
      permit_application =
        create(
          :permit_application,
          permit_project: permit_project,
          submitter: creator
        )
      pre_check =
        create(
          :pre_check,
          creator: creator,
          permit_application: permit_application
        )

      expect(pre_check.search_data).to include(
        id: pre_check.id,
        title: pre_check.title,
        external_id: pre_check.external_id,
        full_address: pre_check.full_address,
        status: pre_check.status,
        creator_id: pre_check.creator_id,
        permit_project_id: pre_check.permit_project&.id,
        jurisdiction_id: pre_check.jurisdiction&.id,
        permit_application_id: pre_check.permit_application_id
      )
    end
  end

  describe "ProjectItem behavior" do
    it "delegates project fields from permit application" do
      creator = create(:user)
      permit_project = create(:permit_project, title: "My permit")
      permit_application =
        create(
          :permit_application,
          permit_project: permit_project,
          submitter: creator
        )
      pre_check =
        create(
          :pre_check,
          creator: creator,
          permit_application: permit_application
        )

      expect(pre_check.title).to eq("My permit")
    end
  end

  describe ".completed_and_unviewed" do
    let(:user) { create(:user) }

    it "includes completed pre-checks without viewed_at" do
      complete_unviewed =
        create(:pre_check, :complete, creator: user, viewed_at: nil)

      expect(PreCheck.completed_and_unviewed).to include(complete_unviewed)
    end

    it "excludes completed pre-checks that have been viewed" do
      complete_viewed =
        create(:pre_check, :complete, creator: user, viewed_at: 1.hour.ago)

      expect(PreCheck.completed_and_unviewed).not_to include(complete_viewed)
    end

    it "excludes pre-checks in processing status" do
      processing =
        create(:pre_check, :processing, creator: user, viewed_at: nil)

      expect(PreCheck.completed_and_unviewed).not_to include(processing)
    end

    it "excludes pre-checks in draft status" do
      draft = create(:pre_check, creator: user, viewed_at: nil)

      expect(PreCheck.completed_and_unviewed).not_to include(draft)
    end
  end

  describe ".unviewed_count_for_user" do
    let(:user) { create(:user) }
    let(:other_user) { create(:user) }

    it "returns count of completed unviewed pre-checks for specific user" do
      create(:pre_check, :complete, creator: user, viewed_at: nil)
      create(:pre_check, :complete, creator: user, viewed_at: nil)

      expect(PreCheck.unviewed_count_for_user(user.id)).to eq(2)
    end

    it "excludes viewed pre-checks" do
      create(:pre_check, :complete, creator: user, viewed_at: nil)
      create(:pre_check, :complete, creator: user, viewed_at: 1.hour.ago)

      expect(PreCheck.unviewed_count_for_user(user.id)).to eq(1)
    end

    it "excludes other users' pre-checks" do
      create(:pre_check, :complete, creator: user, viewed_at: nil)
      create(:pre_check, :complete, creator: other_user, viewed_at: nil)

      expect(PreCheck.unviewed_count_for_user(user.id)).to eq(1)
    end

    it "excludes non-complete pre-checks" do
      create(:pre_check, :complete, creator: user, viewed_at: nil)
      create(:pre_check, :processing, creator: user, viewed_at: nil)
      create(:pre_check, creator: user, viewed_at: nil)

      expect(PreCheck.unviewed_count_for_user(user.id)).to eq(1)
    end

    it "returns 0 when user has no unviewed completed pre-checks" do
      expect(PreCheck.unviewed_count_for_user(user.id)).to eq(0)
    end
  end

  describe "#can_submit?" do
    let(:pre_check) { create(:pre_check, service_partner: :archistar) }
    let(:jurisdiction) { pre_check.jurisdiction }

    before do
      allow(SiteConfiguration).to receive(
        :archistar_enabled_for_jurisdiction?
      ).with(jurisdiction).and_return(archistar_enabled)
    end

    context "when archistar is enabled for jurisdiction" do
      let(:archistar_enabled) { true }

      it "returns true" do
        expect(pre_check.can_submit?).to be true
      end
    end

    context "when archistar is disabled for jurisdiction" do
      let(:archistar_enabled) { false }

      it "returns false" do
        expect(pre_check.can_submit?).to be false
      end
    end

    context "when service_partner is blank" do
      let(:archistar_enabled) { true }

      it "returns false" do
        pre_check.service_partner = nil
        expect(pre_check.can_submit?).to be false
      end
    end
  end

  describe "transitions" do
    describe "submit" do
      let(:pre_check) { create(:pre_check, :with_design_documents) }

      before { allow(pre_check).to receive(:submit_to_archistar) }

      context "when can_submit? is true" do
        before { allow(pre_check).to receive(:can_submit?).and_return(true) }

        it "transitions to processing" do
          expect { pre_check.submit! }.to change(pre_check, :status).from(
            "draft"
          ).to("processing")
        end

        it "calls submit_to_archistar" do
          pre_check.submit!
          expect(pre_check).to have_received(:submit_to_archistar)
        end
      end

      context "when can_submit? is false" do
        before { allow(pre_check).to receive(:can_submit?).and_return(false) }

        it "does not transition" do
          expect { pre_check.submit! }.to raise_error(AASM::InvalidTransition)
        end
      end
    end
  end
end
