require "rails_helper"

RSpec.describe PublicRecordable, type: :model do
  # This spec tests the PublicRecordable concern, which allows records to be
  # "orphaned" (anonymized) instead of deleted when their owner is destroyed.

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
      # Verifies that the model properly registered itself with the concern
      # so the cleanup job knows to check it.
      expect(PublicRecordable.recordable_models).to include(PermitApplication)
    end
  end

  describe "#public_record?" do
    it "returns true for submitted applications" do
      # Submitted apps are legal records and must be kept
      expect(permit_application.public_record?).to be true
    end

    it "returns false for drafts" do
      # Drafts are not legal records and can be deleted
      draft = create(:permit_application, status: :new_draft)
      expect(draft.public_record?).to be false
    end
  end

  describe "#take_user_snapshots!" do
    it "copies user details to snapshot columns" do
      permit_application.take_user_snapshots!
      permit_application.reload

      # Verify data was copied from User to PermitApplication
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
      # Should NOT set orphaned_at because it's not a public record
      expect(draft.orphaned_at).to be_nil
    end
  end

  describe "orphaned record user accessor" do
    before do
      # Manually orphan the record to simulate the cleanup job
      permit_application.take_user_snapshots!
      permit_application.update(submitter_id: nil)
      permit_application.reload
    end

    it "returns a readonly User when submitter is nil" do
      # Even though submitter_id is nil, .submitter returns a User populated with snapshot data
      expect(permit_application.submitter).to be_a(User)
      expect(permit_application.submitter).to be_readonly
    end

    it "populates User with snapshot data" do
      # The User object should be populated from the snapshot columns
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

    it "marks the user as discarded" do
      # The readonly User should appear as discarded
      deleted_user = permit_application.submitter
      expect(deleted_user.discarded_at).to be_present
    end
  end

  describe "immutability" do
    before do
      permit_application.take_user_snapshots!
      permit_application.reload
    end

    it "allows updates to orphaned_at" do
      # System fields can still be updated
      expect(permit_application.update(orphaned_at: Time.current)).to be true
    end

    it "prevents other updates when orphaned" do
      # Business data should be locked
      expect(permit_application.orphaned?).to be true
      permit_application.nickname = "New Nickname"
      expect(permit_application.save).to be false
      expect(permit_application.errors[:base]).to include(
        "Cannot update an orphaned record"
      )
    end

    it "allows updates if not orphaned" do
      # If we un-orphan it (theoretically), it becomes editable again
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

        # The job does this sequence: snapshot -> nullify owner -> destroy user
        public_project.take_user_snapshots!
        public_project.update(owner: nil)
      end

      it "destroys the private project when user is destroyed" do
        user.destroy
        # Private project still had owner_id set, so cascade delete got it
        expect { private_project.reload }.to raise_error(
          ActiveRecord::RecordNotFound
        )
      end

      it "preserves the orphaned public project" do
        user.destroy
        # Public project had owner_id=nil, so it survived the user deletion
        expect(public_project.reload).to be_present
        expect(public_project.owner).to be_a(User)
        expect(public_project.owner).to be_readonly
      end
    end
  end
end
