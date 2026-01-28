require "rails_helper"

RSpec.describe JurisdictionMembership, type: :model do
  describe "associations" do
    it { should belong_to(:jurisdiction) }
    it { should belong_to(:user) }
  end

  describe "collaborator side-effects" do
    let(:jurisdiction) { create(:sub_district) }

    it "creates a jurisdiction collaborator for review_staff users (idempotent)" do
      user = create(:user, :review_manager, jurisdictions_count: 0)
      described_class.create!(jurisdiction: jurisdiction, user: user)
      Collaborator.where(user: user, collaboratorable: jurisdiction).delete_all

      membership = described_class.new(jurisdiction: jurisdiction, user: user)

      expect { membership.send(:create_jurisdiction_collaborator) }.to change(
        Collaborator,
        :count
      ).by(1)

      expect {
        membership.send(:create_jurisdiction_collaborator)
      }.not_to change(Collaborator, :count)
    end

    it "does not create a jurisdiction collaborator for non-review-staff users" do
      user = create(:user, :submitter)
      membership = described_class.new(jurisdiction: jurisdiction, user: user)

      expect {
        membership.send(:create_jurisdiction_collaborator)
      }.not_to change(Collaborator, :count)
    end

    it "destroys an existing jurisdiction collaborator on destroy hook" do
      user = create(:user, :review_manager, jurisdictions_count: 0)
      described_class.create!(jurisdiction: jurisdiction, user: user)
      Collaborator.where(user: user, collaboratorable: jurisdiction).delete_all
      Collaborator.create!(user: user, collaboratorable: jurisdiction)

      membership = described_class.new(jurisdiction: jurisdiction, user: user)
      expect { membership.send(:destroy_jurisdiction_collaborator) }.to change(
        Collaborator,
        :count
      ).by(-1)
    end
  end

  describe "reindexing" do
    it "reindexes the jurisdiction" do
      jurisdiction = create(:sub_district)
      membership =
        described_class.new(
          jurisdiction: jurisdiction,
          user: create(:user, :submitter)
        )

      expect(jurisdiction).to receive(:reindex)
      membership.send(:reindex_jurisdiction)
    end
  end
end
