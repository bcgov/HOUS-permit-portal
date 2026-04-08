require "rails_helper"

RSpec.describe RequirementTemplatePolicy, type: :policy do
  let(:sandbox) { nil }

  def policy(user, record)
    policy_for(described_class, user:, record:, sandbox:)
  end

  describe "#show?" do
    it "permits public templates even for anonymous" do
      record =
        instance_double(
          "RequirementTemplate",
          public?: true,
          early_access?: false
        )
      expect(policy(nil, record).show?).to be true
    end

    it "denies non-public templates for anonymous" do
      record =
        instance_double(
          "RequirementTemplate",
          public?: false,
          early_access?: false
        )
      expect(policy(nil, record).show?).to be false
    end

    it "permits non-public templates for super_admin" do
      admin = create(:user, :super_admin)
      record =
        instance_double(
          "RequirementTemplate",
          public?: false,
          early_access?: false
        )
      expect(policy(admin, record).show?).to be true
    end

    it "permits early_access templates when user has an unexpired, undiscarded preview" do
      user = create(:user)
      record =
        instance_double(
          "RequirementTemplate",
          id: "rt-1",
          public?: false,
          early_access?: true
        )

      previews = instance_double("ActiveRecord::Relation")
      where1 = instance_double("ActiveRecord::Relation")
      where2 = instance_double("ActiveRecord::Relation")

      allow(user).to receive(:early_access_previews).and_return(previews)
      allow(previews).to receive(:where).with(
        early_access_requirement_template_id: record.id,
        discarded_at: nil
      ).and_return(where1)
      allow(where1).to receive(:where).with(
        "expires_at > ?",
        kind_of(Time)
      ).and_return(where2)
      allow(where2).to receive(:exists?).and_return(true)

      expect(policy(user, record).show?).to be true
    end

    it "denies early_access templates when preview does not exist" do
      user = create(:user)
      record =
        instance_double(
          "RequirementTemplate",
          id: "rt-1",
          public?: false,
          early_access?: true
        )

      previews = instance_double("ActiveRecord::Relation")
      where1 = instance_double("ActiveRecord::Relation")
      where2 = instance_double("ActiveRecord::Relation")

      allow(user).to receive(:early_access_previews).and_return(previews)
      allow(previews).to receive(:where).and_return(where1)
      allow(where1).to receive(:where).and_return(where2)
      allow(where2).to receive(:exists?).and_return(false)

      expect(policy(user, record).show?).to be false
    end
  end

  describe "admin-only actions" do
    let(:record) do
      double(
        "RequirementTemplate",
        public?: false,
        early_access?: true,
        scheduled?: true
      )
    end

    it "permits create/update/destroy/etc for super_admin" do
      admin = create(:user, :super_admin)
      p = policy(admin, record)

      expect(p.create?).to be true
      expect(p.index?).to be true
      expect(p.update?).to be true
      expect(p.schedule?).to be true
      expect(p.destroy?).to be true
      expect(p.restore?).to be true
      expect(p.copy?).to be true
      expect(p.update_jurisdiction_availabilities?).to be true
    end

    it "denies create/update/destroy/etc for non-admin" do
      user = create(:user)
      p = policy(user, record)

      expect(p.create?).to be false
      expect(p.index?).to be false
      expect(p.update?).to be false
      expect(p.schedule?).to be false
      expect(p.destroy?).to be false
      expect(p.restore?).to be false
      expect(p.copy?).to be false
      expect(p.update_jurisdiction_availabilities?).to be false
    end
  end

  it "permits for_filter? for anyone" do
    record = double("RequirementTemplate", public?: true, early_access?: false)
    expect(policy(nil, record).for_filter?).to be true
  end

  it "permits unschedule_template_version? only for admin and when scheduled" do
    record =
      double(
        "RequirementTemplate",
        public?: false,
        early_access?: false,
        scheduled?: true
      )
    admin = create(:user, :super_admin)
    user = create(:user)

    expect(policy(admin, record).unschedule_template_version?).to be true
    expect(policy(user, record).unschedule_template_version?).to be false

    unscheduled =
      double(
        "RequirementTemplate",
        public?: false,
        early_access?: false,
        scheduled?: false
      )
    expect(policy(admin, unscheduled).unschedule_template_version?).to be false
  end

  it "permits invite_previewers? only for admin and early_access templates" do
    record = double("RequirementTemplate", public?: false, early_access?: true)
    admin = create(:user, :super_admin)
    user = create(:user)

    expect(policy(admin, record).invite_previewers?).to be true
    expect(policy(user, record).invite_previewers?).to be false

    non_early =
      double("RequirementTemplate", public?: false, early_access?: false)
    expect(policy(admin, non_early).invite_previewers?).to be false
  end

  it "permits force_publish_now? only when enabled and user is admin" do
    record = double("RequirementTemplate", public?: false, early_access?: false)
    admin = create(:user, :super_admin)

    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with("ENABLE_TEMPLATE_FORCE_PUBLISH").and_return(
      "true"
    )
    expect(policy(admin, record).force_publish_now?).to be true

    allow(ENV).to receive(:[]).with("ENABLE_TEMPLATE_FORCE_PUBLISH").and_return(
      "false"
    )
    expect(policy(admin, record).force_publish_now?).to be false
  end
end
