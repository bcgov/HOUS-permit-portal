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

  describe "#remember_user!" do
    it "copies user details without starting the retention clock" do
      permit_application.remember_user!
      permit_application.reload

      expect(permit_application.first_name_snapshot).to eq("Jane")
      expect(permit_application.last_name_snapshot).to eq("Doe")
      expect(permit_application.omniauth_username_snapshot).to eq(
        "jane@example.com"
      )
      expect(permit_application.orphaned_at).to be_nil
      expect(permit_application.discarded_at).to be_nil
    end

    it "uses omniauth_username if present" do
      user.update(omniauth_username: "janedoe123")
      permit_application.remember_user!
      expect(permit_application.omniauth_username_snapshot).to eq("janedoe123")
    end
  end

  describe "#abandon!" do
    it "snapshots the user, stamps the clock, and discards the record" do
      permit_application.abandon!
      permit_application.reload

      expect(permit_application.first_name_snapshot).to eq("Jane")
      expect(permit_application.orphaned_at).to be_present
      expect(permit_application.discarded_at).to be_present
    end
  end

  describe "orphaned record user accessor" do
    before do
      permit_application.abandon!
      permit_application.update!(submitter_membership: nil)
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
      permit_application.abandon!
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
    let(:user) { create(:user, first_name: "Ada", last_name: "Owner") }

    it "discards a project with a submitted application when its last Full member is deleted" do
      project = create(:permit_project, owner: user)
      application =
        create(
          :permit_application,
          :newly_submitted,
          permit_project: project,
          submitter: user,
          jurisdiction: project.jurisdiction
        )

      user.destroy!

      project.reload
      application.reload
      expect(project.orphaned_at).to be_present
      expect(project.discarded_at).to be_present
      expect(project.owner_id).to be_nil
      expect(project.owner).to be_readonly
      expect(project.owner.name).to eq("Ada Owner")
      expect(application.orphaned_at).to be_nil
      expect(application.discarded_at).to be_present
      expect(application).to be_orphaned
      expect(application.submitter).to be_readonly
    end

    it "destroys a drafts-only project when its last Full member is deleted" do
      project = create(:permit_project, owner: user)
      draft =
        create(
          :permit_application,
          permit_project: project,
          submitter: user,
          status: :new_draft,
          jurisdiction: project.jurisdiction
        )

      user.destroy!

      expect(PermitProject.unscoped.exists?(project.id)).to be false
      expect(PermitApplication.unscoped.exists?(draft.id)).to be false
    end

    it "keeps the project when another Full member remains" do
      project = create(:permit_project, owner: user)
      create(:project_membership, permit_project: project, access: :full)
      application =
        create(
          :permit_application,
          :newly_submitted,
          permit_project: project,
          submitter: user,
          jurisdiction: project.jurisdiction
        )

      user.destroy!

      project.reload
      application.reload
      expect(project.orphaned_at).to be_nil
      expect(project.discarded_at).to be_nil
      expect(project.owner_id).to be_nil
      expect(application.orphaned_at).to be_nil
      expect(application.discarded_at).to be_nil
      expect(application.submitter_membership_id).to be_nil
      expect(application.first_name_snapshot).to eq("Ada")
      expect(application).not_to be_orphaned
      expect(application.submitter).to be_readonly
      expect(application.submitter.name).to eq("Ada Owner")
    end
  end
end
