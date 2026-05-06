require "rails_helper"

RSpec.describe ProjectAuditFormatters::BaseFormatter do
  let(:user) { instance_double(User, name: "Alice", blank?: false) }
  let(:viewer) { nil }
  let(:audit) do
    build_audit_double(user: user, auditable_type: "Unknown", action: "create")
  end

  subject(:formatter) { described_class.new(audit, viewer) }

  describe "#description" do
    it "returns the i18n generic fallback" do
      expect(formatter.description).to eq("Alice made a change")
    end
  end

  describe "#permit_application" do
    it "returns nil" do
      expect(formatter.permit_application).to be_nil
    end
  end

  describe "#permit_application_id" do
    it "returns nil" do
      expect(formatter.permit_application_id).to be_nil
    end
  end

  describe "#requirement_block_id" do
    it "returns nil" do
      expect(formatter.requirement_block_id).to be_nil
    end
  end

  describe "#resolve_jurisdiction" do
    let(:jurisdiction) do
      instance_double(
        Jurisdiction,
        qualified_name: "City of Test",
        id: 1,
        present?: true
      )
    end

    context "when auditable has a jurisdiction" do
      let(:auditable) do
        instance_double(PermitProject, jurisdiction: jurisdiction)
      end
      let(:audit) do
        build_audit_double(
          user: user,
          auditable: auditable,
          auditable_type: "PermitProject"
        )
      end

      it "returns the jurisdiction from the auditable" do
        expect(formatter.resolve_jurisdiction).to eq(jurisdiction)
      end
    end

    context "when auditable jurisdiction is nil, falls back to associated" do
      let(:associated_project) do
        instance_double(PermitProject, jurisdiction: jurisdiction)
      end
      let(:audit) do
        build_audit_double(
          user: user,
          auditable_type: "Unknown",
          auditable: nil,
          associated_type: "PermitProject",
          associated: associated_project
        )
      end

      it "returns the jurisdiction from the associated record" do
        allow(audit).to receive_message_chain(
          :auditable,
          :jurisdiction
        ).and_return(nil)
        expect(formatter.resolve_jurisdiction).to eq(jurisdiction)
      end
    end
  end

  describe "user_display (via description)" do
    context "when audit has no user" do
      let(:audit) { build_audit_double(user: nil) }

      before do
        allow(audit).to receive(:user).and_return(nil)
        null_user = double("NilUser", blank?: true)
        allow(audit).to receive(:user).and_return(null_user)
      end

      it 'displays "System"' do
        expect(formatter.description).to eq("System made a change")
      end
    end

    context "when viewer is a submitter viewing a staff user's action" do
      let(:jurisdiction) do
        instance_double(
          Jurisdiction,
          qualified_name: "City Hall",
          id: 1,
          present?: true
        )
      end
      let(:staff_user) do
        instance_double(
          User,
          name: "Staff Person",
          blank?: false,
          jurisdiction_staff?: true
        )
      end
      let(:submitter_viewer) do
        instance_double(User, submitter?: true, present?: true)
      end
      let(:auditable) do
        instance_double(PermitProject, jurisdiction: jurisdiction)
      end
      let(:audit) do
        build_audit_double(
          user: staff_user,
          auditable: auditable,
          auditable_type: "PermitProject"
        )
      end
      let(:viewer) { submitter_viewer }

      before do
        allow(staff_user).to receive(:member_of?).with(
          jurisdiction.id
        ).and_return(true)
      end

      it "masks the staff name with jurisdiction name" do
        expect(formatter.description).to eq("City Hall made a change")
      end
    end

    context "when viewer is a submitter but staff is not a member of the jurisdiction" do
      let(:jurisdiction) do
        instance_double(
          Jurisdiction,
          qualified_name: "City Hall",
          id: 1,
          present?: true
        )
      end
      let(:staff_user) do
        instance_double(
          User,
          name: "External Staff",
          blank?: false,
          jurisdiction_staff?: true
        )
      end
      let(:submitter_viewer) do
        instance_double(User, submitter?: true, present?: true)
      end
      let(:auditable) do
        instance_double(PermitProject, jurisdiction: jurisdiction)
      end
      let(:audit) do
        build_audit_double(
          user: staff_user,
          auditable: auditable,
          auditable_type: "PermitProject"
        )
      end
      let(:viewer) { submitter_viewer }

      before do
        allow(staff_user).to receive(:member_of?).with(
          jurisdiction.id
        ).and_return(false)
      end

      it "shows the staff user's actual name" do
        expect(formatter.description).to eq("External Staff made a change")
      end
    end
  end
end
