require "rails_helper"

RSpec.describe RequirementBlock, type: :model do
  describe "associations" do
    # Testing direct associations
    it { should have_many(:requirements) }
    it "should order requirements by position in ascending order" do
      requirement_block = FactoryBot.create(:requirement_block_with_requirements, requirements_count: 6)

      # This is so that the order is not tied to create order, because by default it returns associations
      # in update order we might get a false positive test, where the position seems correct
      # due to being inserted in order.

      first_requirement = requirement_block.requirements.first

      first_requirement.position = 3
      first_requirement.save

      requirement_block.reload

      requirement_block.requirements.each_with_index { |r, i| expect(r.position).to eq(i) }
    end
  end

  describe "enums" do
    it { should define_enum_for(:sign_off_role).with_prefix(true).with_values(any: 0) }
    it { should define_enum_for(:reviewer_role).with_prefix(true).with_values(any: 0) }
  end

  describe "methods" do
    it "returns the form json with with all requirements" do
      requirement_block = FactoryBot.create(:requirement_block_with_requirements, requirements_count: 6)
      form_json = requirement_block.to_form_json
      expect(form_json.reject { |key| key === :components }).to eq (
           {
             id: requirement_block.id,
             key: requirement_block.key,
             title: requirement_block.name,
             type: "panel",
             collapsible: true,
             collapsed: false,
           }
         )
      # expect 7 because a block that is all optional requirements gets one extra required component
      expect(form_json[:components].count).to eq 7
    end
  end

  describe "validations" do
    let!(:existing_block) { create(:requirement_block, sku: "existing_value") }

    it "validates uniqueness of sku" do
      new_block = build(:requirement_block, sku: existing_block.sku)
      expect(new_block).not_to be_valid
      expect(new_block.errors[:sku]).to include("has already been taken")
    end

    it "validates presence of sku" do
      new_block = create(:requirement_block, sku: nil)
      expect(new_block.sku).to be_present
    end
  end
end
