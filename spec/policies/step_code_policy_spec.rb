require "rails_helper"

RSpec.describe StepCodePolicy, type: :policy do
  let(:jurisdiction) { create(:sub_district) }
  let(:sandbox) { jurisdiction.sandboxes.first }
  let(:submitter) { create(:user, :submitter) }
  let(:permit_application) do
    create(
      :permit_application,
      submitter: submitter,
      jurisdiction: jurisdiction,
      sandbox: sandbox,
      with_fake_plan_document: true
    )
  end

  let(:step_code_block_id) { SecureRandom.uuid }
  let(:other_block_id) { SecureRandom.uuid }

  before do
    permit_application.template_version.update!(
      requirement_blocks_json: {
        step_code_block_id => {
          "name" => "Energy Step Code",
          "requirements" => [
            {
              "id" => SecureRandom.uuid,
              "requirement_code" => "energy_step_code_tool_part_9",
              "input_type" => "energy_step_code"
            }
          ]
        },
        other_block_id => {
          "name" => "Other Block",
          "requirements" => [
            { "id" => SecureRandom.uuid, "input_type" => "text" }
          ]
        }
      }
    )
  end

  def policy_for(user, record)
    described_class.new(UserContext.new(user, sandbox), record)
  end

  context "for the submitter" do
    let(:step_code) do
      create(
        :part_9_step_code,
        permit_application: permit_application,
        creator: submitter
      )
    end

    it "permits create" do
      expect(policy_for(submitter, step_code).create?).to be true
    end

    it "permits update" do
      expect(policy_for(submitter, step_code).update?).to be true
    end

    it "permits show" do
      expect(policy_for(submitter, step_code).show?).to be true
    end

    it "permits reassign_to their own permit application" do
      expect(
        policy_for(submitter, step_code).reassign_to?(permit_application)
      ).to be true
    end
  end

  context "for a submission delegatee collaborator" do
    let(:collaborator_user) { create(:user, :submitter) }
    let(:collaborator) do
      create(
        :collaborator,
        user: collaborator_user,
        collaboratorable: submitter
      )
    end
    let(:step_code) do
      create(
        :part_9_step_code,
        permit_application: permit_application,
        creator: submitter
      )
    end

    before do
      create(
        :permit_collaboration,
        permit_application: permit_application,
        collaborator: collaborator,
        collaboration_type: :submission,
        collaborator_type: :delegatee
      )
    end

    it "permits create" do
      expect(policy_for(collaborator_user, step_code).create?).to be true
    end

    it "permits update" do
      expect(policy_for(collaborator_user, step_code).update?).to be true
    end

    it "permits show" do
      expect(policy_for(collaborator_user, step_code).show?).to be true
    end

    it "permits reassign_to the collaborating permit application" do
      standalone =
        create(
          :part_9_step_code,
          permit_application: nil,
          creator: collaborator_user
        )
      expect(
        policy_for(collaborator_user, standalone).reassign_to?(
          permit_application
        )
      ).to be true
    end
  end

  context "for a submission assignee collaborator assigned to the step code block" do
    let(:collaborator_user) { create(:user, :submitter) }
    let(:collaborator) do
      create(
        :collaborator,
        user: collaborator_user,
        collaboratorable: submitter
      )
    end
    let(:step_code) do
      create(
        :part_9_step_code,
        permit_application: permit_application,
        creator: submitter
      )
    end

    before do
      create(
        :permit_collaboration,
        permit_application: permit_application,
        collaborator: collaborator,
        collaboration_type: :submission,
        collaborator_type: :assignee,
        assigned_requirement_block_id: step_code_block_id
      )
    end

    it "permits create" do
      expect(policy_for(collaborator_user, step_code).create?).to be true
    end

    it "permits update" do
      expect(policy_for(collaborator_user, step_code).update?).to be true
    end

    it "permits show" do
      expect(policy_for(collaborator_user, step_code).show?).to be true
    end

    it "permits reassign_to the collaborating permit application" do
      standalone =
        create(
          :part_9_step_code,
          permit_application: nil,
          creator: collaborator_user
        )
      expect(
        policy_for(collaborator_user, standalone).reassign_to?(
          permit_application
        )
      ).to be true
    end
  end

  context "for a submission assignee collaborator assigned to a different block" do
    let(:collaborator_user) { create(:user, :submitter) }
    let(:collaborator) do
      create(
        :collaborator,
        user: collaborator_user,
        collaboratorable: submitter
      )
    end
    let(:step_code) do
      create(
        :part_9_step_code,
        permit_application: permit_application,
        creator: submitter
      )
    end

    before do
      create(
        :permit_collaboration,
        permit_application: permit_application,
        collaborator: collaborator,
        collaboration_type: :submission,
        collaborator_type: :assignee,
        assigned_requirement_block_id: other_block_id
      )
    end

    it "denies create" do
      expect(policy_for(collaborator_user, step_code).create?).to be false
    end

    it "denies update" do
      expect(policy_for(collaborator_user, step_code).update?).to be false
    end

    it "denies show" do
      expect(policy_for(collaborator_user, step_code).show?).to be false
    end

    it "denies reassign_to" do
      standalone =
        create(
          :part_9_step_code,
          permit_application: nil,
          creator: collaborator_user
        )
      expect(
        policy_for(collaborator_user, standalone).reassign_to?(
          permit_application
        )
      ).to be false
    end
  end

  context "for a user with no collaboration" do
    let(:stranger) { create(:user, :submitter) }
    let(:step_code) do
      create(
        :part_9_step_code,
        permit_application: permit_application,
        creator: submitter
      )
    end

    it "denies create" do
      expect(policy_for(stranger, step_code).create?).to be false
    end

    it "denies update" do
      expect(policy_for(stranger, step_code).update?).to be false
    end

    it "denies show" do
      expect(policy_for(stranger, step_code).show?).to be false
    end

    it "denies reassign_to" do
      standalone =
        create(:part_9_step_code, permit_application: nil, creator: stranger)
      expect(
        policy_for(stranger, standalone).reassign_to?(permit_application)
      ).to be false
    end
  end

  context "for a standalone step code (no permit application)" do
    let(:creator) { create(:user, :submitter) }
    let(:step_code) do
      create(:part_9_step_code, permit_application: nil, creator: creator)
    end

    it "permits create for any logged-in user" do
      other_user = create(:user, :submitter)
      expect(policy_for(other_user, step_code).create?).to be true
    end
  end
end
