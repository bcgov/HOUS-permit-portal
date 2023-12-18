require "rails_helper"

RSpec.describe Requirement, type: :model do
  describe "associations" do
    # Testing direct associations
    it { should have_many(:requirement_block_requirements) }
    it { should have_many(:requirement_blocks).through(:requirement_block_requirements) }
  end

  describe "validations" do
    it "enforces select inputs has defined accepted options" do
      select_requirement = build(:requirement, input_type: "select")
      multi_option_select_requirement = build(:requirement, input_type: "multi_option_select")
      text_requirement = build(:requirement, input_type: "text")
      error_message = "select inputs must have options defined"

      expect(select_requirement).not_to be_valid
      expect(select_requirement.errors[:input_options]).to include(error_message)
      expect(multi_option_select_requirement).not_to be_valid
      expect(multi_option_select_requirement.errors[:input_options]).to include(error_message)
      expect(text_requirement).to be_valid
    end

    it "enforces select inputs to have string options" do
      invalid_select_requirement =
        build(:requirement, input_type: "select", input_options: { "value_options" => [1, "test", 2] })
      valid_select_requirement =
        build(:requirement, input_type: "select", input_options: { "value_options" => %w[1 test 2] })
      error_message = "select inputs must have options defined"

      expect(invalid_select_requirement).not_to be_valid
      expect(invalid_select_requirement.errors[:input_options]).to include(error_message)

      expect(valid_select_requirement).to be_valid
    end
  end

  describe "enums" do
    # TODO: remove xit tests when initial input types are finalized
    xit do
      should define_enum_for(:input_type).with_prefix(true).with_values(
               text: 0,
               number: 1,
               checkbox: 2,
               select: 3,
               multi_option_select: 4,
               date: 5,
             )
    end
  end

  describe "methods" do
    it "returns the options for a select input" do
      select_options = %w[1 test 2]
      select_requirement =
        create(:requirement, input_type: "select", input_options: { "value_options" => select_options })

      expect(select_requirement.value_options).to eq(select_options)
    end
  end
end
