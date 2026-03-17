require "rails_helper"

RSpec.describe UserPolicy, type: :policy do
  let(:jurisdiction) { create(:sub_district) }
  let(:sandbox) { jurisdiction.sandboxes.first }

  subject(:policy_class) { described_class }

  permissions :profile? do
    let(:record) { create(:user) }

    it "permits only the user themselves" do
      expect(policy_class).to permit(UserContext.new(record, sandbox), record)
      expect(policy_class).not_to permit(
        UserContext.new(create(:user), sandbox),
        record
      )
    end
  end

  permissions :license_agreements? do
    let(:record) { create(:user) }

    it "aliases profile?" do
      expect(policy_class).to permit(UserContext.new(record, sandbox), record)
      expect(policy_class).not_to permit(
        UserContext.new(create(:user), sandbox),
        record
      )
    end
  end

  permissions :update? do
    let(:record) { create(:user) }

    it "permits managers only when record is in their jurisdictions" do
      manager = create(:user, :review_manager, jurisdiction:)
      record_in_j = create(:user)
      create(
        :jurisdiction_membership,
        user: record_in_j,
        jurisdiction: jurisdiction
      )
      record_in_j.reload

      expect(policy_class).to permit(
        UserContext.new(manager, sandbox),
        record_in_j
      )

      expect(policy_class).not_to permit(
        UserContext.new(manager, sandbox),
        record
      )
    end
  end

  permissions :invite? do
    let(:record) { create(:user) }

    it "permits super_admin, manager, and technical_support" do
      expect(policy_class).to permit(
        UserContext.new(create(:user, :super_admin), sandbox),
        record
      )
      expect(policy_class).to permit(
        UserContext.new(create(:user, :review_manager, jurisdiction:), sandbox),
        record
      )
      tech = create(:user, role: :technical_support)
      create(:jurisdiction_membership, user: tech, jurisdiction: jurisdiction)
      tech.reload
      expect(policy_class).to permit(UserContext.new(tech, sandbox), record)
      expect(policy_class).not_to permit(
        UserContext.new(create(:user), sandbox),
        record
      )
    end
  end

  permissions :invite_reviewer? do
    let(:record) { create(:user) }

    it "aliases invite?" do
      expect(policy_class).to permit(
        UserContext.new(create(:user, :super_admin), sandbox),
        record
      )
      expect(policy_class).not_to permit(
        UserContext.new(create(:user), sandbox),
        record
      )
    end
  end

  permissions :index? do
    let(:record) { create(:user) }

    it "permits only super_admin" do
      expect(policy_class).to permit(
        UserContext.new(create(:user, :super_admin), sandbox),
        record
      )
      expect(policy_class).not_to permit(
        UserContext.new(create(:user), sandbox),
        record
      )
    end
  end

  permissions :super_admins? do
    let(:record) { create(:user) }

    it "permits only super_admin" do
      expect(policy_class).to permit(
        UserContext.new(create(:user, :super_admin), sandbox),
        record
      )
      expect(policy_class).not_to permit(
        UserContext.new(create(:user), sandbox),
        record
      )
    end
  end

  permissions :search_jurisdiction_users? do
    it "permits super_admin when searching managers/super_admins" do
      super_admin = create(:user, :super_admin)
      manager_record = create(:user, :review_manager, jurisdiction:)
      admin_record = create(:user, :super_admin)

      expect(policy_class).to permit(
        UserContext.new(super_admin, sandbox),
        manager_record
      )
      expect(policy_class).to permit(
        UserContext.new(super_admin, sandbox),
        admin_record
      )
    end

    it "denies super_admin when record is not manager/super_admin" do
      super_admin = create(:user, :super_admin)
      submitter_record = create(:user, :submitter)
      expect(policy_class).not_to permit(
        UserContext.new(super_admin, sandbox),
        submitter_record
      )
    end

    it "permits managers/technical_support when record is in their jurisdictions" do
      manager = create(:user, :review_manager, jurisdiction:)
      tech = create(:user, role: :technical_support)
      create(:jurisdiction_membership, user: tech, jurisdiction: jurisdiction)
      tech.reload
      record_in_j = create(:user)
      create(
        :jurisdiction_membership,
        user: record_in_j,
        jurisdiction: jurisdiction
      )
      record_in_j.reload

      expect(policy_class).to permit(
        UserContext.new(manager, sandbox),
        record_in_j
      )
      expect(policy_class).to permit(
        UserContext.new(tech, sandbox),
        record_in_j
      )
    end
  end

  permissions :search_admin_users? do
    it "permits only when acting user is super_admin and record is super_admin" do
      super_admin = create(:user, :super_admin)
      admin_record = create(:user, :super_admin)
      non_admin_record = create(:user, :review_manager, jurisdiction:)

      expect(policy_class).to permit(
        UserContext.new(super_admin, sandbox),
        admin_record
      )
      expect(policy_class).not_to permit(
        UserContext.new(super_admin, sandbox),
        non_admin_record
      )
      expect(policy_class).not_to permit(
        UserContext.new(create(:user), sandbox),
        admin_record
      )
    end
  end

  permissions :destroy? do
    it "permits self-destroy and jurisdiction-search destroy" do
      user = create(:user)
      expect(policy_class).to permit(UserContext.new(user, sandbox), user)

      manager = create(:user, :review_manager, jurisdiction:)
      record_in_j = create(:user)
      create(
        :jurisdiction_membership,
        user: record_in_j,
        jurisdiction: jurisdiction
      )
      record_in_j.reload
      expect(policy_class).to permit(
        UserContext.new(manager, sandbox),
        record_in_j
      )
    end
  end

  permissions :restore? do
    it "aliases destroy?" do
      user = create(:user)
      expect(policy_class).to permit(UserContext.new(user, sandbox), user)
    end
  end

  permissions :accept_eula? do
    it "aliases profile?" do
      user = create(:user)
      expect(policy_class).to permit(UserContext.new(user, sandbox), user)
      expect(policy_class).not_to permit(
        UserContext.new(create(:user), sandbox),
        user
      )
    end
  end

  permissions :accept_invitation? do
    it "aliases profile?" do
      user = create(:user)
      expect(policy_class).to permit(UserContext.new(user, sandbox), user)
    end
  end

  permissions :resend_confirmation? do
    it "aliases profile?" do
      user = create(:user)
      expect(policy_class).to permit(UserContext.new(user, sandbox), user)
    end
  end

  permissions :reinvite? do
    let(:record) { create(:user) }

    it "aliases invite?" do
      expect(policy_class).to permit(
        UserContext.new(create(:user, :super_admin), sandbox),
        record
      )
      expect(policy_class).not_to permit(
        UserContext.new(create(:user), sandbox),
        record
      )
    end
  end
end
