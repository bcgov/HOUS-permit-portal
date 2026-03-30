require "rails_helper"

RSpec.describe ProjectAuditPresenter do
  let(:user) { instance_double(User, name: "Alice Smith", blank?: false) }
  let(:viewer) { nil }
  let(:auditable) { nil }
  let(:audit) do
    instance_double(
      ApplicationAudit,
      user: user,
      auditable_type: auditable_type,
      auditable_id: "some-id",
      auditable: auditable,
      associated_type: nil,
      associated: nil,
      action: action,
      audited_changes: audited_changes
    )
  end

  subject(:presenter) { described_class.new(audit, viewer) }

  describe "#format_description" do
    context "with an unknown auditable_type" do
      let(:auditable_type) { "SomeUnknownType" }
      let(:action) { "create" }
      let(:audited_changes) { {} }

      it "returns the generic fallback" do
        expect(presenter.format_description).to eq("Alice Smith made a change")
      end
    end
  end

  describe "#resolve_permit_application_id" do
    context "with an unknown auditable_type" do
      let(:auditable_type) { "SomeUnknownType" }
      let(:action) { "create" }
      let(:audited_changes) { {} }

      it "returns nil" do
        expect(presenter.resolve_permit_application_id).to be_nil
      end
    end
  end

  describe "#resolve_permit_name" do
    context "with an unknown auditable_type" do
      let(:auditable_type) { "SomeUnknownType" }
      let(:action) { "create" }
      let(:audited_changes) { {} }

      it "returns nil" do
        expect(presenter.resolve_permit_name).to be_nil
      end
    end
  end

  describe "formatter dispatch" do
    let(:action) { "create" }
    let(:audited_changes) { {} }

    {
      "PermitProject" => ProjectAuditFormatters::PermitProjectFormatter,
      "PermitApplication" => ProjectAuditFormatters::PermitApplicationFormatter,
      "PermitCollaboration" =>
        ProjectAuditFormatters::PermitCollaborationFormatter,
      "PermitBlockStatus" => ProjectAuditFormatters::PermitBlockStatusFormatter
    }.each do |type, formatter_class|
      context "when auditable_type is #{type}" do
        let(:auditable_type) { type }

        it "delegates to #{formatter_class}" do
          formatter = instance_double(formatter_class, description: "test")
          allow(formatter_class).to receive(:new).with(
            audit,
            viewer
          ).and_return(formatter)

          presenter.format_description
          expect(formatter_class).to have_received(:new).with(audit, viewer)
        end
      end
    end

    context "when auditable_type is unrecognized" do
      let(:auditable_type) { "Widget" }

      it "falls back to BaseFormatter" do
        formatter =
          instance_double(
            ProjectAuditFormatters::BaseFormatter,
            description: "fallback"
          )
        allow(ProjectAuditFormatters::BaseFormatter).to receive(:new).with(
          audit,
          viewer
        ).and_return(formatter)

        expect(presenter.format_description).to eq("fallback")
      end
    end
  end
end
