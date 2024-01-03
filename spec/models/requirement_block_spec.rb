require "rails_helper"

RSpec.describe RequirementBlock, type: :model do
  describe "associations" do
    # Testing direct associations
    it { should have_many(:requirement_block_requirements) }
    it { should have_many(:requirements).through(:requirement_block_requirements) }
    it "should order requirements by position in ascending order" do
      requirement_block = FactoryBot.create(:requirement_block_with_requirements, requirements_count: 6)

      # This is so that the order is not tied to create order, because by default it returns associations
      # in update order we might get a false positive test, where the position seems correct
      # due to being inserted in order.

      first_requirement_block_requirement = requirement_block.requirement_block_requirements.first

      first_requirement_block_requirement.position = 3
      first_requirement_block_requirement.save

      requirement_block.reload

      requirement_block.requirement_block_requirements.each_with_index { |r, i| expect(r.position).to eq(i) }
    end
  end

  describe "enums" do
    # TODO: remove xit tests when roles will be defined
    xit { should define_enum_for(:sign_off_role).with_prefix(true).with_values(any: 0) }
    xit { should define_enum_for(:reviewer_role).with_prefix(true).with_values(any: 0) }
  end

  describe "methods" do
    it "returns the form json with with all requirements" do
      requirement_block = FactoryBot.create(:requirement_block_with_requirements, requirements_count: 6)
      form_json = requirement_block.to_form_json
      expect(form_json.reject { |key| key === :components }).to eq (
           {
             id: requirement_block.id,
             legend: requirement_block.name,
             key: "fieldSet#{requirement_block.id}",
             label: requirement_block.name,
             input: false,
             tableView: false,
           }
         )

      expect(form_json[:components].count).to eq 6
    end
  end
end
