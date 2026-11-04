require "rails_helper"

RSpec.describe PermitCollaboration, type: :model do
  describe "associations" do
    subject { build(:permit_collaboration) }

    it { should belong_to(:collaborator) }
    it { should belong_to(:permit_application).touch(true) }
  end

  describe "enums" do
    subject { described_class.new }

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

    def review_collaborator
      reviewer = create(:user, :reviewer, jurisdiction: jurisdiction)
      jurisdiction.collaborators.find_by!(user_id: reviewer.id)
    end

    describe "uniqueness" do
      it "prevents duplicate collaborations for the same scope" do
        permit_application =
          create(
            :permit_application,
            :newly_submitted,
            jurisdiction: jurisdiction
          )
        collaborator = review_collaborator
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
          collaborator_type: :assignee,
          assigned_requirement_block_id: assigned_requirement_block_id
        )

        duplicate =
          build(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: collaborator,
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
          create(
            :permit_application,
            :newly_submitted,
            jurisdiction: jurisdiction
          )

        collaboration =
          build(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: review_collaborator,
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
          create(
            :permit_application,
            :newly_submitted,
            jurisdiction: jurisdiction
          )

        collaboration =
          build(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: review_collaborator,
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
          create(
            :permit_application,
            :newly_submitted,
            jurisdiction: jurisdiction
          )
        collaborator = review_collaborator

        create(
          :permit_collaboration,
          permit_application: permit_application,
          collaborator: collaborator,
          collaborator_type: :delegatee
        )

        duplicate =
          build(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: collaborator,
            collaborator_type: :delegatee
          )

        expect(duplicate).not_to be_valid
        expect(
          duplicate.errors.of_kind?(:collaborator_id, :delegatee_already_exists)
        ).to be(true)
      end
    end

    describe "must be submitted for review" do
      it "requires the permit application to have been submitted" do
        permit_application =
          create(:permit_application, jurisdiction: jurisdiction)

        collaboration =
          build(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: review_collaborator
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
        collaborator =
          other_jurisdiction.collaborators.find_by!(user_id: reviewer.id)

        collaboration =
          build(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: collaborator
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

  describe "instance methods" do
    let(:jurisdiction) { create(:sub_district) }

    def review_collaborator(user: nil)
      reviewer = user || create(:user, :reviewer, jurisdiction: jurisdiction)
      jurisdiction.collaborators.find_by!(user_id: reviewer.id)
    end

    describe "#collaborator_name" do
      it "returns the collaborator user's name" do
        collaborator_user =
          create(
            :user,
            :reviewer,
            first_name: "Taylor",
            last_name: "Ng",
            jurisdiction: jurisdiction
          )
        collaboration =
          create(
            :permit_collaboration,
            collaborator: review_collaborator(user: collaborator_user),
            permit_application:
              create(
                :permit_application,
                :newly_submitted,
                jurisdiction: jurisdiction
              )
          )

        expect(collaboration.collaborator_name).to eq("Taylor Ng")
      end
    end

    describe "#assigned_requirement_block_name and #assigned_block_exists?" do
      it "returns the assigned block name and whether it exists" do
        permit_application =
          create(
            :permit_application,
            :newly_submitted,
            jurisdiction: jurisdiction
          )
        block_id = SecureRandom.uuid
        permit_application.template_version.update!(
          requirement_blocks_json: {
            block_id => {
              "name" => "Water Supply System"
            }
          }
        )

        collaboration =
          create(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: review_collaborator,
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
        permit_application =
          create(
            :permit_application,
            :newly_submitted,
            jurisdiction: jurisdiction
          )
        collaboration =
          create(
            :permit_collaboration,
            permit_application: permit_application,
            collaborator: review_collaborator,
            collaborator_type: :delegatee
          )

        data = collaboration.collaboration_assignment_notification_data
        expect(data["action_type"]).to eq(
          Constants::NotificationActionTypes::REVIEW_COLLABORATION_ASSIGNMENT
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
        collaborator_user = create(:user, :reviewer, jurisdiction: jurisdiction)
        collaborator_user.preference.update!(
          enable_in_app_collaboration_notification: true
        )
        collaboration =
          create(
            :permit_collaboration,
            collaborator: review_collaborator(user: collaborator_user),
            permit_application:
              create(
                :permit_application,
                :newly_submitted,
                jurisdiction: jurisdiction
              )
          )

        allow(NotificationService).to receive(
          :publish_permit_collaboration_unassignment_event
        )

        collaboration.discard
        expect(NotificationService).to have_received(
          :publish_permit_collaboration_unassignment_event
        ).with(collaboration)
      end

      it "does not publish unassignment notification when disabled in collaborator preferences" do
        collaborator_user = create(:user, :reviewer, jurisdiction: jurisdiction)
        collaborator_user.preference.update!(
          enable_in_app_collaboration_notification: false
        )
        collaboration =
          create(
            :permit_collaboration,
            collaborator: review_collaborator(user: collaborator_user),
            permit_application:
              create(
                :permit_application,
                :newly_submitted,
                jurisdiction: jurisdiction
              )
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
