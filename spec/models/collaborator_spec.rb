require "rails_helper"

RSpec.describe Collaborator, type: :model do
  describe "associations" do
    it { should belong_to(:user) }
    it { should belong_to(:collaboratorable) }
    it { should have_many(:permit_collaborations).dependent(:destroy) }
  end

  describe "validations" do
    it do
      should validate_inclusion_of(:collaboratorable_type).in_array(
               %w[User Jurisdiction]
             )
    end

    it "enforces uniqueness of user scoped to collaboratorable" do
      user = create(:user, :submitter)
      owner = create(:user, :submitter)

      described_class.create!(user: user, collaboratorable: owner)
      dup = described_class.new(user: user, collaboratorable: owner)

      expect(dup).not_to be_valid
      expect(dup.errors[:user]).to include("has already been taken")
    end
  end

  describe "custom validation validate_user" do
    context "when collaboratorable is a Jurisdiction" do
      let(:jurisdiction) { create(:sub_district) }

      it "is invalid when user is not review_staff" do
        user = create(:user, :submitter)
        record = described_class.new(user: user, collaboratorable: jurisdiction)

        expect(record).not_to be_valid
        expect(record.errors.details[:user].first[:error]).to eq(
          :incorrect_jurisdiction
        )
      end

      it "is invalid when review_staff user is not a member of the jurisdiction" do
        user = create(:user, :review_manager, jurisdictions_count: 0)
        record = described_class.new(user: user, collaboratorable: jurisdiction)

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
        record = described_class.new(user: user, collaboratorable: jurisdiction)

        expect(record).to be_valid
      end
    end

    context "when collaboratorable is a User" do
      it "is invalid when user equals collaboratorable" do
        user = create(:user, :submitter)
        record = described_class.new(user: user, collaboratorable: user)

        expect(record).not_to be_valid
        expect(record.errors.details[:user].first[:error]).to eq(
          :incorrect_user
        )
      end

      it "is invalid when user is not a submitter" do
        submitter_owner = create(:user, :submitter)
        reviewer = create(:user, :reviewer, jurisdictions_count: 0)

        record =
          described_class.new(user: reviewer, collaboratorable: submitter_owner)

        expect(record).not_to be_valid
        expect(record.errors.details[:user].first[:error]).to eq(
          :submission_collaborator_must_be_submitter
        )
      end

      it "is valid when user is a submitter and different from collaboratorable" do
        submitter_owner = create(:user, :submitter)
        other_submitter = create(:user, :submitter)

        record =
          described_class.new(
            user: other_submitter,
            collaboratorable: submitter_owner
          )
        expect(record).to be_valid
      end
    end
  end

  describe "#search_data" do
    it "includes user fields and collaboratorable metadata" do
      collaborator = create(:collaborator)
      data = collaborator.search_data

      expect(data).to include(
        collaboratorable_type: collaborator.collaboratorable_type,
        collaboratorable_id: collaborator.collaboratorable_id,
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
end
