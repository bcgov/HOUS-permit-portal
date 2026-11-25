require "rails_helper"

RSpec.describe Collaborator, type: :model do
  describe "associations" do
    it { should belong_to(:user) }
    it { should belong_to(:jurisdiction) }
    it { should have_many(:permit_collaborations).dependent(:destroy) }
    it { should have_many(:permit_project_collaborations).dependent(:destroy) }
  end

  describe "validations" do
    it "enforces uniqueness of user scoped to jurisdiction" do
      jurisdiction = create(:sub_district)
      user = create(:user, :reviewer, jurisdiction: jurisdiction)
      dup = described_class.new(user: user, jurisdiction: jurisdiction)

      expect(dup).not_to be_valid
      expect(dup.errors[:user]).to include("has already been taken")
    end
  end

  describe "custom validation validate_user" do
    let(:jurisdiction) { create(:sub_district) }

    it "is invalid when user is not review_staff" do
      user = create(:user, :submitter)
      record = described_class.new(user: user, jurisdiction: jurisdiction)

      expect(record).not_to be_valid
      expect(record.errors.details[:user].first[:error]).to eq(
        :incorrect_jurisdiction
      )
    end

    it "is invalid when review_staff user is not a member of the jurisdiction" do
      user = create(:user, :review_manager, jurisdictions_count: 0)
      record = described_class.new(user: user, jurisdiction: jurisdiction)

      expect(record).not_to be_valid
      expect(record.errors.details[:user].first[:error]).to eq(
        :incorrect_jurisdiction
      )
    end

    it "is valid when review_staff user is a member of the jurisdiction" do
      user = create(:user, :review_manager, jurisdictions_count: 0)
      allow(user).to receive_message_chain(:jurisdictions, :find_by).with(
        id: jurisdiction.id
      ).and_return(jurisdiction)
      record = described_class.new(user: user, jurisdiction: jurisdiction)

      expect(record).to be_valid
    end
  end

  describe "#search_data" do
    it "includes user fields and jurisdiction id" do
      collaborator = create(:collaborator)
      data = collaborator.search_data

      expect(data).to include(
        jurisdiction_id: collaborator.jurisdiction_id,
        first_name: collaborator.user.first_name,
        last_name: collaborator.user.last_name,
        email: collaborator.user.email
      )
    end
  end

  describe "callbacks" do
    it "reindexes permit applications when user_id changes" do
      collaborator = create(:collaborator)
      create(:permit_collaboration, collaborator: collaborator)

      expect_any_instance_of(PermitApplication).to receive(:reindex).at_least(
        :once
      )
      collaborator.update!(user: create(:user, :submitter))
    end
  end

  describe "dependent destroys" do
    it "destroys permit project collaborations before deleting the collaborator" do
      permit_project_collaboration = create(:permit_project_collaboration)
      collaborator = permit_project_collaboration.collaborator

      expect { collaborator.destroy! }.to change(
        PermitProjectCollaboration,
        :count
      ).by(-1)
    end
  end
end
