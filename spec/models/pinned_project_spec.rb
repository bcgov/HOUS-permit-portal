require "rails_helper"

RSpec.describe PinnedProject, type: :model do
  describe "associations" do
    it { should belong_to(:user) }
    it { should belong_to(:permit_project) }
  end

  describe "database constraints" do
    it "enforces uniqueness on [user_id, permit_project_id]" do
      user = create(:user)
      project = create(:permit_project, owner: user)

      described_class.create!(user: user, permit_project: project)
      dup = described_class.new(user: user, permit_project: project)

      expect { dup.save!(validate: false) }.to raise_error(
        ActiveRecord::RecordNotUnique
      )
    end
  end
end
