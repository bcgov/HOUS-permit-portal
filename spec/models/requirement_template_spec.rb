require "rails_helper"

RSpec.describe RequirementTemplate, type: :model do
  describe "associations" do
    it { should belong_to(:activity) }
    it { should belong_to(:permit_type) }
    it { should have_many(:requirement_template_sections) }
    it { should have_many(:template_versions) }
    it { should have_one(:published_template_version) }
  end

  describe "visibility" do
    it "returns early_access for early access templates" do
      template = build(:early_access_requirement_template)
      expect(template.visibility).to eq("early_access")
    end

    it "returns live for live templates" do
      template = build(:live_requirement_template)
      expect(template.visibility).to eq("live")
    end
  end

  describe "#label" do
    it "includes permit type and activity names" do
      permit_type = create(:permit_type, name: "Permit A")
      activity = create(:activity, name: "Activity B")
      template =
        build(
          :live_requirement_template,
          permit_type: permit_type,
          activity: activity,
          first_nations: false
        )

      expect(template.label).to eq("Permit A | Activity B")
    end

    it "adds first nations indicator when flagged" do
      permit_type = create(:permit_type, name: "Permit A")
      activity = create(:activity, name: "Activity B")
      template =
        build(
          :live_requirement_template,
          permit_type: permit_type,
          activity: activity,
          first_nations: true
        )

      expect(template.label).to include(
        I18n.t("activerecord.attributes.requirement_template.first_nations")
      )
    end
  end

  describe "public visibility validation" do
    it "only allows public templates for early access" do
      template = build(:live_requirement_template, public: true)

      expect(template).not_to be_valid
      expect(template.errors[:public]).to be_present
    end
  end

  describe "template version associations" do
    it "returns the published template version" do
      template = create(:live_requirement_template)
      published =
        create(
          :template_version,
          requirement_template: template,
          status: :published
        )
      create(
        :template_version,
        requirement_template: template,
        status: :scheduled
      )

      expect(template.published_template_version).to eq(published)
    end

    it "returns the last three deprecated versions" do
      template = create(:live_requirement_template)
      create_list(
        :template_version,
        4,
        requirement_template: template,
        status: :deprecated
      )

      expect(template.last_three_deprecated_template_versions.length).to eq(3)
    end
  end

  describe "#published_customizations_count" do
    it "returns cached count from published template version" do
      template = create(:live_requirement_template)
      published =
        create(
          :template_version,
          requirement_template: template,
          status: :published,
          jurisdiction_template_version_customizations_count: 4
        )

      expect(template.published_template_version).to eq(published)
      expect(template.published_customizations_count).to eq(4)
    end
  end

  describe "validations on nested attributes" do
    it "rejects duplicate requirement blocks in the same template" do
      template = build(:live_requirement_template)
      block = create(:requirement_block)

      template.requirement_template_sections_attributes_copy = [
        {
          "template_section_blocks_attributes" => [
            { "requirement_block_id" => block.id },
            { "requirement_block_id" => block.id }
          ]
        }
      ]

      expect(template).not_to be_valid
      expect(template.errors[:base]).to include(
        I18n.t(
          "model_validation.requirement_template.duplicate_block_in_template",
          requirement_block_name: block.name
        )
      )
    end

    it "requires architectural drawing when step code requirements are present" do
      template = build(:live_requirement_template)
      block = create(:requirement_block)
      create(
        :energy_step_code_tool_part_9_requirement,
        requirement_block: block
      )

      template.requirement_template_sections_attributes_copy = [
        {
          "template_section_blocks_attributes" => [
            { "requirement_block_id" => block.id }
          ]
        }
      ]

      template.valid?

      expect(template.errors.details[:base]).to include(
        error: :step_code_package_required
      )
    end

    it "rejects duplicate energy step code requirements" do
      template = build(:live_requirement_template)
      energy_block_1 = create(:requirement_block)
      energy_block_2 = create(:requirement_block)
      arch_block = create(:requirement_block)

      create(
        :energy_step_code_tool_part_9_requirement,
        requirement_block: energy_block_1
      )
      create(
        :energy_step_code_tool_part_9_requirement,
        requirement_block: energy_block_2
      )
      create(
        :architectural_drawing_file_requirement,
        requirement_block: arch_block
      )

      template.requirement_template_sections_attributes_copy = [
        {
          "template_section_blocks_attributes" => [
            { "requirement_block_id" => energy_block_1.id },
            { "requirement_block_id" => energy_block_2.id },
            { "requirement_block_id" => arch_block.id }
          ]
        }
      ]

      template.valid?

      expect(template.errors.details[:base]).to include(
        error: :duplicate_energy_step_code
      )
    end

    it "rejects duplicate architectural drawing requirements" do
      template = build(:live_requirement_template)
      energy_block = create(:requirement_block)
      arch_block_1 = create(:requirement_block)
      arch_block_2 = create(:requirement_block)

      create(
        :energy_step_code_tool_part_9_requirement,
        requirement_block: energy_block
      )
      create(
        :architectural_drawing_file_requirement,
        requirement_block: arch_block_1
      )
      create(
        :architectural_drawing_file_requirement,
        requirement_block: arch_block_2
      )

      template.requirement_template_sections_attributes_copy = [
        {
          "template_section_blocks_attributes" => [
            { "requirement_block_id" => energy_block.id },
            { "requirement_block_id" => arch_block_1.id },
            { "requirement_block_id" => arch_block_2.id }
          ]
        }
      ]

      template.valid?

      expect(template.errors.details[:base]).to include(
        error: :duplicate_step_code_package
      )
    end
  end

  describe "template copying" do
    it "copies sections and requirement blocks" do
      template = create(:live_requirement_template)
      section =
        create(:requirement_template_section, requirement_template: template)
      block = create(:requirement_block)
      create(
        :template_section_block,
        requirement_template_section: section,
        requirement_block: block
      )

      copied =
        RequirementTemplateCopyService.new(
          template
        ).build_requirement_template_from_existing(
          nickname: "Copy",
          first_nations: !template.first_nations
        )

      expect(copied).to be_valid
      expect(copied.copied_from).to eq(template)
      expect(copied.requirement_template_sections.count).to eq(1)
      expect(copied.requirement_blocks.count).to eq(1)
    end
  end
end
