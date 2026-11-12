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

    it "lets an Expanded member attach a Step Code they created" do
      expanded = create(:user, :submitter)
      create(
        :project_membership,
        permit_project: permit_application.permit_project,
        user: expanded,
        access: :expanded
      )
      standalone =
        create(
          :part_9_step_code,
          permit_application: nil,
          creator: expanded,
          sandbox: sandbox
        )

      expect(policy_for(expanded, standalone).update?).to be true
      expect(
        policy_for(expanded, standalone).reassign_to?(permit_application)
      ).to be true
    end

    it "denies a Standard member from attaching a Step Code they created" do
      standard = create(:user, :submitter)
      create(
        :project_membership,
        permit_project: permit_application.permit_project,
        user: standard,
        access: :standard
      )
      standalone =
        create(
          :part_9_step_code,
          permit_application: nil,
          creator: standard,
          sandbox: sandbox
        )

      expect(policy_for(standard, standalone).update?).to be true
      expect(
        policy_for(standard, standalone).reassign_to?(permit_application)
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

  context "for a standalone Step Code (no permit application)" do
    let(:creator) { create(:user, :submitter) }
    let(:step_code) do
      create(:part_9_step_code, permit_application: nil, creator: creator)
    end

    it "permits create for any logged-in user" do
      other_user = create(:user, :submitter)
      expect(policy_for(other_user, step_code).create?).to be true
    end
  end

  describe "Scope" do
    it "includes standalone Step Codes created by the user in the same sandbox" do
      visible =
        create(
          :part_9_step_code,
          permit_application: nil,
          creator: submitter,
          sandbox: sandbox
        )
      hidden =
        create(
          :part_9_step_code,
          permit_application: nil,
          creator: create(:user, :submitter),
          sandbox: sandbox
        )
      other_sandbox =
        create(
          :part_9_step_code,
          permit_application: nil,
          creator: submitter,
          sandbox: (jurisdiction.sandboxes.to_a - [sandbox]).first
        )

      resolved =
        described_class::Scope.new(
          UserContext.new(submitter, sandbox),
          StepCode.all
        ).resolve

      expect(resolved).to include(visible)
      expect(resolved).not_to include(hidden)
      expect(resolved).not_to include(other_sandbox)
    end

    it "scopes attached Step Codes through the permit application policy scope" do
      other_submitter = create(:user, :submitter)
      visible_permit_application =
        create(
          :permit_application,
          submitter: submitter,
          jurisdiction: jurisdiction,
          sandbox: sandbox,
          with_fake_plan_document: true
        )
      hidden_permit_application =
        create(
          :permit_application,
          submitter: other_submitter,
          jurisdiction: jurisdiction,
          sandbox: sandbox,
          with_fake_plan_document: true
        )
      visible =
        create(
          :part_9_step_code,
          permit_application: visible_permit_application,
          creator: other_submitter
        )
      hidden =
        create(
          :part_9_step_code,
          permit_application: hidden_permit_application,
          creator: submitter
        )

      resolved =
        described_class::Scope.new(
          UserContext.new(submitter, sandbox),
          StepCode.all
        ).resolve

      expect(resolved).to include(visible)
      expect(resolved).not_to include(hidden)
    end
  end

  context "for a Standard member of the project" do
    let(:standard) { create(:user, :submitter) }
    let(:step_code) do
      create(
        :part_9_step_code,
        permit_application: permit_application,
        creator: submitter
      )
    end

    before do
      create(
        :project_membership,
        permit_project: permit_application.permit_project,
        user: standard,
        access: :standard
      )
    end

    it "denies show, update, create, destroy, and restore" do
      expect(policy_for(standard, step_code).show?).to be false
      expect(policy_for(standard, step_code).create?).to be false
      expect(policy_for(standard, step_code).update?).to be false
      expect(policy_for(standard, step_code).destroy?).to be false
      expect(policy_for(standard, step_code).restore?).to be false
    end
  end

  context "for an Expanded member of the project" do
    let(:expanded) { create(:user, :submitter) }
    let(:step_code) do
      create(
        :part_9_step_code,
        permit_application: permit_application,
        creator: submitter
      )
    end

    before do
      create(
        :project_membership,
        permit_project: permit_application.permit_project,
        user: expanded,
        access: :expanded
      )
    end

    it "permits show, create, update, destroy, and restore" do
      expect(policy_for(expanded, step_code).show?).to be true
      expect(policy_for(expanded, step_code).create?).to be true
      expect(policy_for(expanded, step_code).update?).to be true
      expect(policy_for(expanded, step_code).destroy?).to be true
      expect(policy_for(expanded, step_code).restore?).to be true
    end
  end

  it "lets a Full member who did not create the step code delete it" do
    member = create(:user, :submitter)
    create(
      :project_membership,
      permit_project: permit_application.permit_project,
      user: member,
      access: :full
    )
    step_code =
      create(
        :part_9_step_code,
        permit_application: permit_application,
        creator: submitter
      )

    expect(policy_for(member, step_code).show?).to be true
    expect(policy_for(member, step_code).update?).to be true
    expect(policy_for(member, step_code).destroy?).to be true
    expect(policy_for(member, step_code).restore?).to be true
  end

  it "denies a Standard member from deleting a Step Code they created on the application" do
    standard = create(:user, :submitter)
    create(
      :project_membership,
      permit_project: permit_application.permit_project,
      user: standard,
      access: :standard
    )
    step_code =
      create(
        :part_9_step_code,
        permit_application: permit_application,
        creator: standard
      )

    expect(policy_for(standard, step_code).destroy?).to be false
    expect(policy_for(standard, step_code).restore?).to be false
  end

  it "denies a reviewer who is not a member from creating or editing an attached Step Code" do
    reviewer = create(:user, :reviewer, jurisdiction: jurisdiction)
    step_code =
      create(
        :part_9_step_code,
        permit_application: permit_application,
        creator: submitter
      )

    expect(policy_for(reviewer, step_code).create?).to be false
    expect(policy_for(reviewer, step_code).update?).to be false
    expect(policy_for(reviewer, step_code).destroy?).to be false
  end

  context "for a Full member of a different project" do
    let(:outsider) { create(:user, :submitter) }
    let(:other_application) do
      create(
        :permit_application,
        submitter: outsider,
        jurisdiction: jurisdiction,
        sandbox: sandbox,
        with_fake_plan_document: true
      )
    end
    let(:step_code) do
      create(
        :part_9_step_code,
        permit_application: permit_application,
        creator: submitter
      )
    end
    let(:own_step_code) do
      create(
        :part_9_step_code,
        permit_application: other_application,
        creator: outsider
      )
    end

    def expect_outsider_is_full
      expect(
        other_application.permit_project.project_memberships.find_by!(
          user: outsider
        )
      ).to be_full
    end

    it "show? denies a Full member of a different project" do
      expect_outsider_is_full

      expect(policy_for(outsider, own_step_code).show?).to be true
      expect(policy_for(outsider, step_code).show?).to be false
    end

    it "update? denies a Full member of a different project" do
      expect_outsider_is_full

      expect(policy_for(outsider, own_step_code).update?).to be true
      expect(policy_for(outsider, step_code).update?).to be false
    end

    it "create? denies a Full member of a different project" do
      expect_outsider_is_full

      expect(policy_for(outsider, own_step_code).create?).to be true
      expect(policy_for(outsider, step_code).create?).to be false
    end

    it "destroy? denies a Full member of a different project" do
      expect_outsider_is_full

      expect(policy_for(outsider, own_step_code).destroy?).to be true
      expect(policy_for(outsider, step_code).destroy?).to be false
    end

    it "restore? denies a Full member of a different project" do
      expect_outsider_is_full

      expect(policy_for(outsider, own_step_code).restore?).to be true
      expect(policy_for(outsider, step_code).restore?).to be false
    end

    it "reassign_to? denies a Full member of a different project" do
      expect_outsider_is_full
      standalone =
        create(
          :part_9_step_code,
          permit_application: nil,
          creator: outsider,
          sandbox: sandbox
        )

      expect(
        policy_for(outsider, standalone).reassign_to?(other_application)
      ).to be true
      expect(
        policy_for(outsider, standalone).reassign_to?(permit_application)
      ).to be false
    end
  end
end
