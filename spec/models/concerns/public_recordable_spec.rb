require "rails_helper"

RSpec.describe PublicRecordable, type: :model do
  # Use PermitApplication as the test subject since it includes the concern
  let(:user) do
    create(
      :user,
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com"
    )
  end
  let(:permit_application) do
    create(:permit_application, :newly_submitted, submitter: user)
  end

  describe "registration" do
    it "registers the model in recordable_models" do
      expect(PublicRecordable.recordable_models).to include(PermitApplication)
    end
  end

  describe "#public_record?" do
    it "returns true for submitted applications" do
      expect(permit_application.public_record?).to be true
    end

    it "returns false for drafts" do
      draft = create(:permit_application, status: :new_draft)
      expect(draft.public_record?).to be false
    end
  end

  describe "#take_user_snapshots!" do
    it "copies user details to snapshot columns" do
      permit_application.take_user_snapshots!
      permit_application.reload

      expect(permit_application.first_name_snapshot).to eq("Jane")
      expect(permit_application.last_name_snapshot).to eq("Doe")
      # Omniauth username defaults to email if not present
      expect(permit_application.omniauth_username_snapshot).to eq(
        "jane@example.com"
      )
      expect(permit_application.orphaned_at).to be_present
    end

    it "uses omniauth_username if present" do
      user.update(omniauth_username: "janedoe123")
      permit_application.take_user_snapshots!
      expect(permit_application.omniauth_username_snapshot).to eq("janedoe123")
    end

    it "does nothing if not a public record" do
      draft = create(:permit_application, status: :new_draft, submitter: user)
      draft.take_user_snapshots!
      expect(draft.orphaned_at).to be_nil
    end
  end

  describe "DeletedUser mock" do
    before do
      permit_application.take_user_snapshots!
      permit_application.update(submitter_id: nil)
      permit_application.reload
    end

    it "returns a DeletedUser object when user is nil" do
      expect(permit_application.submitter).to be_a(
        PublicRecordable::DeletedUser
      )
    end

    it "populates DeletedUser with snapshot data" do
      deleted_user = permit_application.submitter
      expect(deleted_user.first_name).to eq("Jane")
      expect(deleted_user.last_name).to eq("Doe")
      expect(deleted_user.name).to eq("Jane Doe")
    end

    it "handles missing snapshot data gracefully" do
      permit_application.update_columns(first_name_snapshot: nil)
      permit_application.reload
      expect(permit_application.submitter.first_name).to eq(
        I18n.t("misc.removed_placeholder")
      )
    end

    it "returns specific role checks as false" do
      deleted_user = permit_application.submitter
      expect(deleted_user.submitter?).to be false
      expect(deleted_user.review_staff?).to be false
      expect(deleted_user.jurisdiction_staff?).to be false
    end
  end

  describe "immutability" do
    before do
      permit_application.take_user_snapshots!
      permit_application.reload
    end

    it "allows updates to orphaned_at" do
      expect(permit_application.update(orphaned_at: Time.current)).to be true
    end

    it "prevents other updates when orphaned" do
      expect(permit_application.orphaned?).to be true
      permit_application.nickname = "New Nickname"
      expect(permit_application.save).to be false
      expect(permit_application.errors[:base]).to include(
        "Cannot update an orphaned record"
      )
    end

    it "allows updates if not orphaned" do
      permit_application.update_columns(orphaned_at: nil)
      permit_application.nickname = "New Nickname"
      expect(permit_application.save).to be true
    end
  end

  describe "interaction with user destruction" do
    let(:user) { create(:user) }

    context "PermitProject (dependent: :destroy)" do
      let!(:public_project) { create(:permit_project, owner: user) }
      let!(:private_project) { create(:permit_project, owner: user) }

      before do
        # Simulate public record logic: manually orphan the public one
        # PermitProject relies on permit_applications for public_record?
        allow(public_project).to receive(:public_record?).and_return(true)
        allow(private_project).to receive(:public_record?).and_return(false)

        # The job does this:
        public_project.take_user_snapshots!
        public_project.update(owner: nil)
      end

      it "destroys the private project when user is destroyed" do
        user.destroy
        expect { private_project.reload }.to raise_error(
          ActiveRecord::RecordNotFound
        )
      end

      it "preserves the orphaned public project" do
        user.destroy
        expect(public_project.reload).to be_present
        expect(public_project.owner).to be_a(PublicRecordable::DeletedUser)
      end
    end
  end
end
