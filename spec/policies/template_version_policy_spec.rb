require "rails_helper"

RSpec.describe TemplateVersionPolicy, type: :policy do
  let(:user) { create(:user) }
  let(:record) do
    double(
      "TemplateVersion",
      scheduled?: false,
      draft?: false,
      publicly_previewable?: false,
      sandbox: :s1,
      jurisdiction_id: "j1"
    )
  end

  def policy(user, sandbox:)
    policy_for(described_class, user:, record:, sandbox:)
  end

  describe "#show?" do
    it "permits when sandbox is nil/published and record not scheduled" do
      sandbox = nil
      expect(policy(user, sandbox:).show?).to be true
    end

    it "permits scheduled record only for super_admin in published mode" do
      scheduled_record =
        double(
          "TemplateVersion",
          scheduled?: true,
          draft?: false,
          publicly_previewable?: false,
          sandbox: :s1,
          jurisdiction_id: "j1"
        )
      sandbox = nil

      p =
        policy_for(
          described_class,
          user: create(:user, :super_admin),
          record: scheduled_record,
          sandbox:
        )
      expect(p.show?).to be true

      p2 =
        policy_for(described_class, user:, record: scheduled_record, sandbox:)
      expect(p2.show?).to be false
    end

    it "permits scheduled record in a scheduled sandbox only when record is scheduled" do
      scheduled_sandbox =
        instance_double("Sandbox", scheduled?: true, published?: false)
      scheduled_record =
        double(
          "TemplateVersion",
          scheduled?: true,
          draft?: false,
          publicly_previewable?: false,
          sandbox: scheduled_sandbox,
          jurisdiction_id: "j1"
        )
      unscheduled_record =
        double(
          "TemplateVersion",
          scheduled?: false,
          draft?: false,
          publicly_previewable?: false,
          sandbox: scheduled_sandbox,
          jurisdiction_id: "j1"
        )

      expect(
        policy_for(
          described_class,
          user:,
          record: scheduled_record,
          sandbox: scheduled_sandbox
        ).show?
      ).to be true
      expect(
        policy_for(
          described_class,
          user:,
          record: unscheduled_record,
          sandbox: scheduled_sandbox
        ).show?
      ).to be false
    end
  end

  it "permits show_jurisdiction_template_version_customization? only when sandbox matches" do
    sandbox = :s1
    expect(
      policy(user, sandbox:).show_jurisdiction_template_version_customization?
    ).to be true
    expect(
      policy(
        user,
        sandbox: :other
      ).show_jurisdiction_template_version_customization?
    ).to be false
  end

  it "permits downloads only for super_admin" do
    sandbox = nil
    admin = create(:user, :super_admin)
    expect(policy(admin, sandbox:).download_summary_csv?).to be true
    expect(policy(admin, sandbox:).download_customization_csv?).to be true
    expect(policy(admin, sandbox:).download_customization_json?).to be true

    expect(policy(user, sandbox:).download_summary_csv?).to be false
  end

  it "permits customization update actions for review managers who are members" do
    sandbox = nil
    rm = create(:user, :review_manager)
    allow(rm).to receive(:member_of?).with(record.jurisdiction_id).and_return(
      true
    )
    p = policy(rm, sandbox:)
    expect(
      p.create_or_update_jurisdiction_template_version_customization?
    ).to be true
    expect(p.show_integration_mapping?).to be true
    expect(p.promote_jurisdiction_template_version_customization?).to be true
  end

  describe "Scope" do
    let(:sandbox) { nil }

    it "applies published-only restriction for non-admin users without sandbox" do
      scope = double("ScopeRelation")
      joined = double("JoinedRelation")
      where1 = double("Where1Relation")
      where2 = double("Where2Relation")
      where_chain = instance_double("ActiveRecord::QueryMethods::WhereChain")
      published_only = double("PublishedOnlyRelation")

      allow(scope).to receive(:joins).with(:requirement_template).and_return(
        joined
      )
      allow(joined).to receive(:where).with(
        requirement_templates: {
          discarded_at: nil
        }
      ).and_return(where1)
      allow(where1).to receive(:where).and_return(where_chain)
      allow(where_chain).to receive(:not).with(status: "deprecated").and_return(
        where2
      )
      allow(where2).to receive(:where).with(status: "published").and_return(
        published_only
      )

      resolved =
        described_class::Scope.new(
          UserContext.new(user, sandbox),
          scope
        ).resolve
      expect(resolved).to eq(published_only)
    end

    it "uses for_sandbox when sandbox is present" do
      sandbox = instance_double("Sandbox")
      scope = double("ScopeRelation")
      joined = double("JoinedRelation")
      where1 = double("Where1Relation")
      where2 = double("Where2Relation")
      where_chain = instance_double("ActiveRecord::QueryMethods::WhereChain")
      for_sandbox_rel = double("ForSandboxRelation")

      allow(scope).to receive(:joins).and_return(joined)
      allow(joined).to receive(:where).and_return(where1)
      allow(where1).to receive(:where).and_return(where_chain)
      allow(where_chain).to receive(:not).with(status: "deprecated").and_return(
        where2
      )
      allow(where2).to receive(:for_sandbox).with(sandbox).and_return(
        for_sandbox_rel
      )

      resolved =
        described_class::Scope.new(
          UserContext.new(user, sandbox),
          scope
        ).resolve
      expect(resolved).to eq(for_sandbox_rel)
    end
  end
end
