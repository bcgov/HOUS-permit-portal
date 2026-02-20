require "rails_helper"

RSpec.describe PermitCollaboration, type: :model do
  describe "associations" do
    subject { build(:permit_collaboration) }

    it { should belong_to(:collaborator) }
    it { should belong_to(:permit_application).touch(true) }
  end

  describe "enums" do
    subject { build_stubbed(:permit_collaboration) }

    it do
      should define_enum_for(:collaboration_type).with_values(
               submission: 0,
               review: 1
             )
    end

    it do
      should define_enum_for(:collaborator_type).with_values(
               delegatee: 0,
               assignee: 1
             ).backed_by_column_of_type(:integer)
    end

    it "defaults collaborator_type to delegatee" do
      collaboration = described_class.new
      expect(collaboration.collaborator_type).to eq("delegatee")
    end
  end

  describe "validations" do
    let(:jurisdiction) { create(:sub_district) }

    describe "uniqueness" do
      it "prevents duplicate collaborations for the same scope" do
        permit_application =
          create(:permit_application, jurisdiction: jurisdiction)
        collaborator =
          create(
            :collaborator,
            user: create(:user),
            collaboratorable: create(:user)
          )

        assigned_requirement_block_id = SecureRandom.uuid
        permit_application.template_version.update!(
          requirement_blocks_json: {
            assigned_requirement_block_id => {
              "name" => "Block A"
            }
          }
        )

        create(
          :permit_collaboration,
          permit_application: permit_application,
          collaborator: collaborator,
          collaboration_type: :submission,
          collaborator_type: :assignee,
          assigned_requirement_block_id: assigned_requirement_block_id
        )

        duplicate =
          build(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: collaborator,
            collaboration_type: :submission,
            collaborator_type: :assignee,
            assigned_requirement_block_id: assigned_requirement_block_id
          )

        expect(duplicate).not_to be_valid
        expect(duplicate.errors.of_kind?(:permit_application_id, :taken)).to be(
          true
        )
      end
    end

    describe "assigned_requirement_block_id" do
      it "requires assigned_requirement_block_id when collaborator_type is assignee" do
        permit_application =
          create(:permit_application, jurisdiction: jurisdiction)
        collaborator =
          create(
            :collaborator,
            user: create(:user),
            collaboratorable: create(:user)
          )

        collaboration =
          build(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: collaborator,
            collaboration_type: :submission,
            collaborator_type: :assignee,
            assigned_requirement_block_id: nil
          )

        expect(collaboration).not_to be_valid
        expect(
          collaboration.errors[:assigned_requirement_block_id]
        ).to be_present
      end

      it "validates assigned_requirement_block_id exists in template_version.requirement_blocks_json for assignees (on create)" do
        permit_application =
          create(:permit_application, jurisdiction: jurisdiction)
        collaborator =
          create(
            :collaborator,
            user: create(:user),
            collaboratorable: create(:user)
          )

        collaboration =
          build(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: collaborator,
            collaboration_type: :submission,
            collaborator_type: :assignee,
            assigned_requirement_block_id: SecureRandom.uuid
          )

        expect(collaboration).not_to be_valid
        expect(
          collaboration.errors.of_kind?(
            :assigned_requirement_block_id,
            :does_not_exist
          )
        ).to be(true)
      end
    end

    describe "delegatee uniqueness per collaborator" do
      it "prevents creating multiple delegatee collaborations for the same collaborator on a permit application" do
        permit_application =
          create(:permit_application, jurisdiction: jurisdiction)
        collaborator =
          create(
            :collaborator,
            user: create(:user),
            collaboratorable: create(:user)
          )

        create(
          :permit_collaboration,
          permit_application: permit_application,
          collaborator: collaborator,
          collaboration_type: :submission,
          collaborator_type: :delegatee
        )

        duplicate =
          build(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: collaborator,
            collaboration_type: :submission,
            collaborator_type: :delegatee
          )

        expect(duplicate).not_to be_valid
        expect(
          duplicate.errors.of_kind?(:collaborator_id, :delegatee_already_exists)
        ).to be(true)
      end
    end

    describe "author cannot be a submission collaborator" do
      it "adds an error when collaborator.user is the permit_application submitter (submission)" do
        permit_application =
          create(:permit_application, jurisdiction: jurisdiction)
        collaborator =
          create(
            :collaborator,
            user: permit_application.submitter,
            collaboratorable: create(:user)
          )

        collaboration =
          build(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: collaborator,
            collaboration_type: :submission,
            collaborator_type: :delegatee
          )

        expect(collaboration).not_to be_valid
        expect(
          collaboration.errors.of_kind?(:collaborator, :cannot_be_author)
        ).to be(true)
      end
    end

    describe "collaboration_type must match permit application state" do
      it "requires permit application to be draft for submission collaborations" do
        permit_application =
          create(
            :permit_application,
            :newly_submitted,
            jurisdiction: jurisdiction
          )
        collaborator =
          create(
            :collaborator,
            user: create(:user),
            collaboratorable: create(:user)
          )

        collaboration =
          build(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: collaborator,
            collaboration_type: :submission
          )

        expect(collaboration).not_to be_valid
        expect(
          collaboration.errors.of_kind?(:base, :must_be_draft_for_submission)
        ).to be(true)
      end

      it "requires permit application to be submitted for review collaborations" do
        permit_application =
          create(:permit_application, jurisdiction: jurisdiction) # draft
        reviewer = create(:user, :reviewer, jurisdiction: jurisdiction)
        collaborator = jurisdiction.collaborators.find_by!(user_id: reviewer.id)

        collaboration =
          build(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: collaborator,
            collaboration_type: :review
          )

        expect(collaboration).not_to be_valid
        expect(
          collaboration.errors.of_kind?(:base, :must_be_submitted_for_review)
        ).to be(true)
      end
    end

    describe "review collaborator must be in same jurisdiction" do
      it "adds an error when collaborator.user is not a member of the permit application's jurisdiction" do
        permit_application =
          create(
            :permit_application,
            :newly_submitted,
            jurisdiction: jurisdiction
          )
        other_jurisdiction = create(:sub_district)
        reviewer = create(:user, :reviewer, jurisdiction: other_jurisdiction)

        # reviewer is a collaborator for other_jurisdiction, but not for permit_application.jurisdiction
        collaborator =
          other_jurisdiction.collaborators.find_by!(user_id: reviewer.id)

        collaboration =
          build(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: collaborator,
            collaboration_type: :review
          )

        expect(collaboration).not_to be_valid
        expect(
          collaboration.errors.of_kind?(
            :collaborator,
            :must_be_same_jurisdiction
          )
        ).to be(true)
      end
    end
  end

  describe "callbacks" do
    it "defaults collaboration_type to submission when collaboratorable is a User" do
      permit_application = create(:permit_application)
      collaborator =
        create(
          :collaborator,
          user: create(:user),
          collaboratorable: create(:user)
        )

      collaboration =
        described_class.new(
          permit_application: permit_application,
          collaborator: collaborator
        )
      expect(collaboration.collaboration_type).to eq("submission")
    end

    it "defaults collaboration_type to review when collaboratorable is a Jurisdiction" do
      jurisdiction = create(:sub_district)
      permit_application =
        create(
          :permit_application,
          :newly_submitted,
          jurisdiction: jurisdiction
        )
      reviewer = create(:user, :reviewer, jurisdiction: jurisdiction)
      collaborator = jurisdiction.collaborators.find_by!(user_id: reviewer.id)

      collaboration =
        described_class.new(
          permit_application: permit_application,
          collaborator: collaborator
        )
      expect(collaboration.collaboration_type).to eq("review")
    end
  end

  describe "instance methods" do
    describe "#collaborator_name" do
      it "returns the collaborator user's name" do
        collaborator_user = create(:user, first_name: "Taylor", last_name: "Ng")
        collaborator =
          create(
            :collaborator,
            user: collaborator_user,
            collaboratorable: create(:user)
          )
        collaboration =
          create(:permit_collaboration, collaborator: collaborator)

        expect(collaboration.collaborator_name).to eq("Taylor Ng")
      end
    end

    describe "#inviter_name" do
      it "returns the collaboratorable name (inviter)" do
        inviter = create(:user, first_name: "Avery", last_name: "Smith")
        collaborator =
          create(:collaborator, user: create(:user), collaboratorable: inviter)
        collaboration =
          create(:permit_collaboration, collaborator: collaborator)

        expect(collaboration.inviter_name).to eq("Avery Smith")
      end
    end

    describe "#assigned_requirement_block_name and #assigned_block_exists?" do
      it "returns the assigned block name and whether it exists" do
        permit_application = create(:permit_application)
        block_id = SecureRandom.uuid
        permit_application.template_version.update!(
          requirement_blocks_json: {
            block_id => {
              "name" => "Water Supply System"
            }
          }
        )

        collaborator =
          create(
            :collaborator,
            user: create(:user),
            collaboratorable: create(:user)
          )
        collaboration =
          create(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: collaborator,
            collaboration_type: :submission,
            collaborator_type: :assignee,
            assigned_requirement_block_id: block_id
          )

        expect(collaboration.assigned_requirement_block_name).to eq(
          "Water Supply System"
        )
        expect(collaboration.assigned_block_exists?).to be(true)
      end
    end

    describe "#collaboration_assignment_notification_data" do
      it "sets action_type and object_data keys" do
        permit_application = create(:permit_application)
        collaborator =
          create(
            :collaborator,
            user: create(:user),
            collaboratorable: create(:user)
          )
        collaboration =
          create(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: collaborator,
            collaboration_type: :submission,
            collaborator_type: :delegatee
          )

        data = collaboration.collaboration_assignment_notification_data
        expect(data["action_type"]).to eq(
          Constants::NotificationActionTypes::SUBMISSION_COLLABORATION_ASSIGNMENT
        )
        expect(data["object_data"]["permit_application_id"]).to eq(
          permit_application.id
        )
        expect(data["object_data"]["collaborator_type"]).to eq("delegatee")
        expect(data["object_data"]).to have_key(
          "assigned_requirement_block_name"
        )
      end
    end

    describe "destroy callbacks" do
      it "publishes unassignment notification when enabled in collaborator preferences" do
        permit_application = create(:permit_application)
        collaborator_user = create(:user)
        Preference.create!(
          user: collaborator_user,
          enable_in_app_collaboration_notification: true
        )

        collaborator =
          create(
            :collaborator,
            user: collaborator_user,
            collaboratorable: create(:user)
          )
        collaboration =
          create(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: collaborator
          )

        allow(NotificationService).to receive(
          :publish_permit_collaboration_unassignment_event
        )

        collaboration.destroy!
        expect(NotificationService).to have_received(
          :publish_permit_collaboration_unassignment_event
        ).with(collaboration)
      end

      it "does not publish unassignment notification when disabled in collaborator preferences" do
        permit_application = create(:permit_application)
        collaborator_user = create(:user)
        Preference.create!(
          user: collaborator_user,
          enable_in_app_collaboration_notification: false
        )

        collaborator =
          create(
            :collaborator,
            user: collaborator_user,
            collaboratorable: create(:user)
          )
        collaboration =
          create(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: collaborator
          )

        allow(NotificationService).to receive(
          :publish_permit_collaboration_unassignment_event
        )

        collaboration.destroy!
        expect(NotificationService).not_to have_received(
          :publish_permit_collaboration_unassignment_event
        )
      end
    end
  end
end
