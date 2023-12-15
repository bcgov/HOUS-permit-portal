require "rails_helper"

RSpec.describe RequirementBlockRequirement, type: :model do
  describe "associations" do
    it { should belong_to(:requirement_block) }
    it { should belong_to(:requirement) }
  end

  describe "validations" do
    context "uniqueness of requirement per requirement block" do
      it "has only one instance of the same requirement per requirement block" do
        requirement = create(:requirement)
        requirement_block = create(:requirement_block)

        requirement_block_requirement_1 =
          create(:requirement_block_requirement, requirement: requirement, requirement_block: requirement_block)
        requirement_block_requirement_2 =
          build(:requirement_block_requirement, requirement: requirement, requirement_block: requirement_block)

        expect(requirement_block_requirement_2).not_to be_valid
        expect(requirement_block_requirement_2.errors[:requirement]).to include("has already been taken")
      end

      it "has allows different combinations of requirement per requirement block" do
        requirement_1 = create(:requirement)
        requirement_2 = create(:requirement)
        requirement_block = create(:requirement_block)

        requirement_block_requirement_1 =
          create(:requirement_block_requirement, requirement: requirement_1, requirement_block: requirement_block)
        requirement_block_requirement_2 =
          build(:requirement_block_requirement, requirement: requirement_2, requirement_block: requirement_block)

        expect(requirement_block_requirement_2).to be_valid
      end
    end
  end

  context "positions of requirements" do
    it "starts position at 0" do
      requirement = FactoryBot.create(:requirement_block_with_requirements, requirements_count: 1)
      expect(requirement.requirement_block_requirements.first.position).to eq(0)
    end

    it "can have duplicate positions when requirements are added to different requirement blocks" do
      requirement_1 = FactoryBot.create(:requirement_block_with_requirements, requirements_count: 1)
      requirement_2 = FactoryBot.create(:requirement_block_with_requirements, requirements_count: 1)

      expect(requirement_1.requirement_block_requirements.first.position).to eq(0)
      expect(requirement_2.requirement_block_requirements.first.position).to eq(0)
    end

    it "does not have duplicate positions when multiple requirements are added to the same requirement block" do
      requirement_1 = create(:requirement)
      requirement_2 = create(:requirement)
      requirement_block = create(:requirement_block)
      requirement_block_requirement_1 =
        create(:requirement_block_requirement, requirement: requirement_1, requirement_block: requirement_block)
      requirement_block_requirement_2 =
        create(:requirement_block_requirement, requirement: requirement_2, requirement_block: requirement_block)

      expect(requirement_block_requirement_1.position).to eq(0)
      expect(requirement_block_requirement_2.position).to eq(1)
    end
  end
end
