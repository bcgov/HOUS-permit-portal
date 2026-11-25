require "rails_helper"

RSpec.describe PermitCollaborationPolicy, type: :policy do
  let(:jurisdiction) { create(:sub_district) }
  let(:sandbox) { jurisdiction.sandboxes.first }
  let(:submitter) { create(:user, :submitter) }
  let(:permit_application) do
    instance_double(
      "PermitApplication",
      submitter: submitter,
      jurisdiction_id: jurisdiction.id
    )
  end
  let(:record) do
    instance_double(
      "PermitCollaboration",
      permit_application: permit_application
    )
  end

  def policy(user, record)
    policy_for(described_class, user:, record:, sandbox:)
  end

  %i[destroy? reinvite?].each do |query|
    describe "##{query}" do
      it "permits review staff in the application's jurisdiction" do
        reviewer = create(:user, :review_manager, jurisdiction:)

        expect(policy(reviewer, record).public_send(query)).to be true
      end

      it "denies submitters" do
        expect(policy(submitter, record).public_send(query)).to be false
      end

      it "denies review staff from another jurisdiction" do
        reviewer = create(:user, :review_manager)

        expect(policy(reviewer, record).public_send(query)).to be false
      end
    end
  end
end
