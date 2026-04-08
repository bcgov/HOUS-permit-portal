require "rails_helper"

RSpec.describe ProjectAuditFormatters::PermitBlockStatusFormatter do
  let(:user) { instance_double(User, name: "Alice", blank?: false) }
  let(:viewer) { nil }
  let(:permit_application) do
    instance_double(
      PermitApplication,
      jurisdiction: instance_double(Jurisdiction),
      id: "pa-1"
    )
  end

  subject(:formatter) { described_class.new(audit, viewer) }

  describe "#description" do
    context "when auditable is nil" do
      let(:audit) do
        build_audit_double(
          user: user,
          auditable: nil,
          auditable_type: "PermitBlockStatus",
          action: "update"
        )
      end

      it "returns generic fallback" do
        expect(formatter.description).to eq("Alice made a change")
      end
    end

    context "with a valid block status" do
      let(:block_status) do
        instance_double(
          PermitBlockStatus,
          blank?: false,
          requirement_block_name: "Structural",
          permit_application: permit_application,
          permit_application_id: "pa-1",
          requirement_block_id: "block-1"
        )
      end

      context 'when action is "update"' do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: block_status,
            auditable_type: "PermitBlockStatus",
            action: "update"
          )
        end

        it "returns status change message with block name" do
          expect(formatter.description).to eq(
            "Alice changed status of Structural"
          )
        end
      end

      context 'when action is "destroy"' do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: block_status,
            auditable_type: "PermitBlockStatus",
            action: "destroy"
          )
        end

        it "returns status removal message" do
          expect(formatter.description).to eq(
            "Alice removed status for Structural"
          )
        end
      end

      context "with an unrecognized action" do
        let(:audit) do
          build_audit_double(
            user: user,
            auditable: block_status,
            auditable_type: "PermitBlockStatus",
            action: "create"
          )
        end

        it "returns the i18n block fallback" do
          expect(formatter.description).to eq(
            "Alice made a change to Structural"
          )
        end
      end
    end

    context "when block name is blank" do
      let(:block_status) do
        instance_double(
          PermitBlockStatus,
          blank?: false,
          requirement_block_name: nil,
          permit_application: permit_application,
          permit_application_id: "pa-1",
          requirement_block_id: "block-1"
        )
      end

      let(:audit) do
        build_audit_double(
          user: user,
          auditable: block_status,
          auditable_type: "PermitBlockStatus",
          action: "update"
        )
      end

      it 'falls back to "requirement block"' do
        expect(formatter.description).to eq(
          "Alice changed status of requirement block"
        )
      end
    end
  end

  describe "#permit_application" do
    let(:block_status) do
      instance_double(
        PermitBlockStatus,
        permit_application: permit_application,
        blank?: false
      )
    end
    let(:audit) do
      build_audit_double(
        user: user,
        auditable: block_status,
        auditable_type: "PermitBlockStatus",
        action: "update"
      )
    end

    it "returns the block status's permit application" do
      expect(formatter.permit_application).to eq(permit_application)
    end
  end

  describe "#permit_application_id" do
    let(:block_status) do
      instance_double(
        PermitBlockStatus,
        permit_application_id: "pa-1",
        blank?: false
      )
    end
    let(:audit) do
      build_audit_double(
        user: user,
        auditable: block_status,
        auditable_type: "PermitBlockStatus",
        action: "update"
      )
    end

    it "returns the permit_application_id" do
      expect(formatter.permit_application_id).to eq("pa-1")
    end
  end

  describe "#requirement_block_id" do
    let(:block_status) do
      instance_double(
        PermitBlockStatus,
        requirement_block_id: "block-42",
        blank?: false
      )
    end
    let(:audit) do
      build_audit_double(
        user: user,
        auditable: block_status,
        auditable_type: "PermitBlockStatus",
        action: "update"
      )
    end

    it "returns the requirement_block_id" do
      expect(formatter.requirement_block_id).to eq("block-42")
    end
  end
end
