require "rails_helper"

RSpec.describe RequirementTemplatePolicy, type: :policy do
  let(:sandbox) { nil }

  def policy(user, record)
    policy_for(described_class, user:, record:, sandbox:)
  end

  describe "#show?" do
    it "denies anonymous users" do
      record = instance_double("RequirementTemplate")
      expect(policy(nil, record).show?).to be false
    end

    it "permits super_admin" do
      admin = create(:user, :super_admin)
      record = instance_double("RequirementTemplate")
      expect(policy(admin, record).show?).to be true
    end
  end

  describe "admin-only actions" do
    let(:record) { double("RequirementTemplate") }

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
    record = double("RequirementTemplate")
    expect(policy(nil, record).for_filter?).to be true
  end

  it "permits unschedule_template_version? only for admin and when scheduled" do
    record = double("RequirementTemplate", scheduled?: true)
    admin = create(:user, :super_admin)
    user = create(:user)

    expect(policy(admin, record).unschedule_template_version?).to be true
    expect(policy(user, record).unschedule_template_version?).to be false

    unscheduled = double("RequirementTemplate", scheduled?: false)
    expect(policy(admin, unscheduled).unschedule_template_version?).to be false
  end

  it "permits force_publish_now? only when enabled and user is admin" do
    record = double("RequirementTemplate")
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
