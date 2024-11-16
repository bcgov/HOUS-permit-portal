require "rails_helper"

RSpec.describe RequirementTemplateSection, type: :model do
  let(:requirement_template) { create(:live_requirement_template, id: "a") }

  describe "associations" do
    it { should belong_to(:requirement_template) }
    it do
      should have_many(:template_section_blocks).dependent(:destroy).order(
               position: :asc
             )
    end
    it do
      should have_many(:requirement_blocks).through(:template_section_blocks)
    end
  end

  describe "#key" do
    it "returns the correct section key" do
      section =
        create(
          :requirement_template_section,
          requirement_template: requirement_template
        )
      expect(section.key).to eq("section#{section.id}")
    end
  end

  describe "#to_form_json" do
    it "returns a hash representation of the section for form generation" do
      section =
        create(
          :requirement_template_section,
          requirement_template: requirement_template,
          name: "Test Section"
        )
      rb1 = create(:requirement_block_with_requirements, requirements_count: 1)
      rb2 = create(:requirement_block_with_requirements, requirements_count: 1)
      tsb1 =
        create(
          :template_section_block,
          requirement_template_section: section,
          requirement_block: rb1
        )
      tsb2 =
        create(
          :template_section_block,
          requirement_template_section: section,
          requirement_block: rb2
        )

      form_json = section.to_form_json
      expect(form_json[:id]).to eq(section.id)

      component_ids = form_json[:components].map { |comp| comp[:id] }
      expect(component_ids).to include(rb1.id)
      expect(component_ids).to include(rb2.id)
    end
  end
end
