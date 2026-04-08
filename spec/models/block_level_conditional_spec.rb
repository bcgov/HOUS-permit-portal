require "rails_helper"

RSpec.describe "Block-level conditionals", type: :model do
  describe "RequirementTemplate#validate_block_level_conditionals" do
    let(:template) { build(:live_requirement_template) }

    let(:trigger_block) { create(:requirement_block) }
    let(:trigger_requirement) do
      create(
        :requirement,
        requirement_block: trigger_block,
        input_type: "select",
        input_options: {
          "value_options" => [
            { "label" => "Yes", "value" => "yes" },
            { "label" => "No", "value" => "no" }
          ]
        }
      )
    end

    let(:dependent_block) { create(:requirement_block) }

    before { trigger_requirement }

    def set_nested_attributes_copy(sections_data)
      template.requirement_template_sections_attributes_copy = sections_data
    end

    it "accepts a valid block conditional" do
      set_nested_attributes_copy(
        [
          {
            "template_section_blocks_attributes" => [
              { "requirement_block_id" => trigger_block.id },
              {
                "requirement_block_id" => dependent_block.id,
                "conditional" => {
                  "when_block_id" => trigger_block.id,
                  "when_requirement_code" =>
                    trigger_requirement.requirement_code,
                  "operator" => "isEqual",
                  "eq" => "yes",
                  "show" => true
                }
              }
            ]
          }
        ]
      )

      template.valid?
      expect(template.errors[:base]).to be_empty
    end

    it "accepts a valid block conditional with hide" do
      set_nested_attributes_copy(
        [
          {
            "template_section_blocks_attributes" => [
              { "requirement_block_id" => trigger_block.id },
              {
                "requirement_block_id" => dependent_block.id,
                "conditional" => {
                  "when_block_id" => trigger_block.id,
                  "when_requirement_code" =>
                    trigger_requirement.requirement_code,
                  "operator" => "isEqual",
                  "eq" => "yes",
                  "hide" => true
                }
              }
            ]
          }
        ]
      )

      template.valid?
      expect(template.errors[:base]).to be_empty
    end

    it "rejects a conditional missing when_block_id" do
      set_nested_attributes_copy(
        [
          {
            "template_section_blocks_attributes" => [
              { "requirement_block_id" => trigger_block.id },
              {
                "requirement_block_id" => dependent_block.id,
                "conditional" => {
                  "when_requirement_code" =>
                    trigger_requirement.requirement_code,
                  "operator" => "isEqual",
                  "eq" => "yes",
                  "show" => true
                }
              }
            ]
          }
        ]
      )

      template.valid?
      expect(template.errors[:base]).to include(
        "Block conditional must have when_block_id, when_requirement_code, and operator (plus eq for value-based operators)"
      )
    end

    it "rejects a conditional missing eq" do
      set_nested_attributes_copy(
        [
          {
            "template_section_blocks_attributes" => [
              { "requirement_block_id" => trigger_block.id },
              {
                "requirement_block_id" => dependent_block.id,
                "conditional" => {
                  "when_block_id" => trigger_block.id,
                  "when_requirement_code" =>
                    trigger_requirement.requirement_code,
                  "operator" => "isEqual",
                  "show" => true
                }
              }
            ]
          }
        ]
      )

      template.valid?
      expect(template.errors[:base]).to include(
        "Block conditional must have when_block_id, when_requirement_code, and operator (plus eq for value-based operators)"
      )
    end

    it "rejects a conditional with neither show nor hide" do
      set_nested_attributes_copy(
        [
          {
            "template_section_blocks_attributes" => [
              { "requirement_block_id" => trigger_block.id },
              {
                "requirement_block_id" => dependent_block.id,
                "conditional" => {
                  "when_block_id" => trigger_block.id,
                  "when_requirement_code" =>
                    trigger_requirement.requirement_code,
                  "operator" => "isEqual",
                  "eq" => "yes"
                }
              }
            ]
          }
        ]
      )

      template.valid?
      expect(template.errors[:base]).to include(
        "Block conditional must specify either show or hide"
      )
    end

    it "rejects a conditional with both show and hide" do
      set_nested_attributes_copy(
        [
          {
            "template_section_blocks_attributes" => [
              { "requirement_block_id" => trigger_block.id },
              {
                "requirement_block_id" => dependent_block.id,
                "conditional" => {
                  "when_block_id" => trigger_block.id,
                  "when_requirement_code" =>
                    trigger_requirement.requirement_code,
                  "operator" => "isEqual",
                  "eq" => "yes",
                  "show" => true,
                  "hide" => true
                }
              }
            ]
          }
        ]
      )

      template.valid?
      expect(template.errors[:base]).to include(
        "Block conditional must specify only one of show or hide"
      )
    end

    it "rejects a self-referencing block conditional" do
      set_nested_attributes_copy(
        [
          {
            "template_section_blocks_attributes" => [
              {
                "requirement_block_id" => trigger_block.id,
                "conditional" => {
                  "when_block_id" => trigger_block.id,
                  "when_requirement_code" =>
                    trigger_requirement.requirement_code,
                  "operator" => "isEqual",
                  "eq" => "yes",
                  "show" => true
                }
              }
            ]
          }
        ]
      )

      template.valid?
      expect(template.errors[:base]).to include(
        "Block conditional cannot reference itself; use requirement-level conditionals instead"
      )
    end

    it "rejects a conditional referencing a block not in the template" do
      outside_block = create(:requirement_block)

      set_nested_attributes_copy(
        [
          {
            "template_section_blocks_attributes" => [
              { "requirement_block_id" => dependent_block.id },
              {
                "requirement_block_id" => trigger_block.id,
                "conditional" => {
                  "when_block_id" => outside_block.id,
                  "when_requirement_code" => "some_code",
                  "operator" => "isEqual",
                  "eq" => "yes",
                  "show" => true
                }
              }
            ]
          }
        ]
      )

      template.valid?
      expect(template.errors[:base]).to include(
        "Block conditional references a block not in this template"
      )
    end

    it "rejects a conditional referencing a nonexistent requirement code" do
      set_nested_attributes_copy(
        [
          {
            "template_section_blocks_attributes" => [
              { "requirement_block_id" => trigger_block.id },
              {
                "requirement_block_id" => dependent_block.id,
                "conditional" => {
                  "when_block_id" => trigger_block.id,
                  "when_requirement_code" => "nonexistent_code",
                  "operator" => "isEqual",
                  "eq" => "yes",
                  "show" => true
                }
              }
            ]
          }
        ]
      )

      template.valid?
      expect(template.errors[:base]).to include(
        "Block conditional references a requirement code that does not exist in the target block"
      )
    end

    it "accepts a valid block conditional with isEmpty operator (no eq required)" do
      set_nested_attributes_copy(
        [
          {
            "template_section_blocks_attributes" => [
              { "requirement_block_id" => trigger_block.id },
              {
                "requirement_block_id" => dependent_block.id,
                "conditional" => {
                  "when_block_id" => trigger_block.id,
                  "when_requirement_code" =>
                    trigger_requirement.requirement_code,
                  "operator" => "isEmpty",
                  "show" => true
                }
              }
            ]
          }
        ]
      )

      template.valid?
      expect(template.errors[:base]).to be_empty
    end

    it "rejects an unrecognized operator" do
      set_nested_attributes_copy(
        [
          {
            "template_section_blocks_attributes" => [
              { "requirement_block_id" => trigger_block.id },
              {
                "requirement_block_id" => dependent_block.id,
                "conditional" => {
                  "when_block_id" => trigger_block.id,
                  "when_requirement_code" =>
                    trigger_requirement.requirement_code,
                  "operator" => "bogusOperator",
                  "eq" => "yes",
                  "show" => true
                }
              }
            ]
          }
        ]
      )

      template.valid?
      expect(template.errors[:base]).to include(
        "Block conditional has an unrecognized operator: bogusOperator"
      )
    end

    it "detects circular block conditional dependencies" do
      block_a = create(:requirement_block)
      req_a =
        create(:requirement, requirement_block: block_a, input_type: "text")

      block_b = create(:requirement_block)
      req_b =
        create(:requirement, requirement_block: block_b, input_type: "text")

      set_nested_attributes_copy(
        [
          {
            "template_section_blocks_attributes" => [
              {
                "requirement_block_id" => block_a.id,
                "conditional" => {
                  "when_block_id" => block_b.id,
                  "when_requirement_code" => req_b.requirement_code,
                  "operator" => "isEqual",
                  "eq" => "foo",
                  "show" => true
                }
              },
              {
                "requirement_block_id" => block_b.id,
                "conditional" => {
                  "when_block_id" => block_a.id,
                  "when_requirement_code" => req_a.requirement_code,
                  "operator" => "isEqual",
                  "eq" => "bar",
                  "show" => true
                }
              }
            ]
          }
        ]
      )

      template.valid?
      expect(template.errors[:base]).to include(
        "Block conditionals contain a circular dependency"
      )
    end

    it "allows non-circular chains (A depends on B, B has no conditional)" do
      block_a = create(:requirement_block)

      block_b = create(:requirement_block)
      req_b =
        create(:requirement, requirement_block: block_b, input_type: "text")

      set_nested_attributes_copy(
        [
          {
            "template_section_blocks_attributes" => [
              {
                "requirement_block_id" => block_a.id,
                "conditional" => {
                  "when_block_id" => block_b.id,
                  "when_requirement_code" => req_b.requirement_code,
                  "operator" => "isEqual",
                  "eq" => "foo",
                  "show" => true
                }
              },
              { "requirement_block_id" => block_b.id }
            ]
          }
        ]
      )

      template.valid?
      block_conditional_errors =
        template.errors[:base].select do |e|
          e.include?("conditional") || e.include?("circular")
        end
      expect(block_conditional_errors).to be_empty
    end
  end

  describe "RequirementBlock#to_form_json with block conditional" do
    let(:template) { create(:live_requirement_template) }
    let(:section) do
      create(:requirement_template_section, requirement_template: template)
    end

    let(:trigger_block) { create(:requirement_block) }
    let!(:trigger_requirement) do
      create(
        :requirement,
        requirement_block: trigger_block,
        requirement_code: "my_trigger_field",
        input_type: "select",
        input_options: {
          "value_options" => [
            { "label" => "Yes", "value" => "yes" },
            { "label" => "No", "value" => "no" }
          ]
        }
      )
    end

    let(:dependent_block) { create(:requirement_block) }

    let!(:trigger_tsb) do
      create(
        :template_section_block,
        requirement_template_section: section,
        requirement_block: trigger_block
      )
    end

    let!(:dependent_tsb) do
      create(
        :template_section_block,
        requirement_template_section: section,
        requirement_block: dependent_block,
        conditional: {
          "when_block_id" => trigger_block.id,
          "when_requirement_code" => "my_trigger_field",
          "operator" => "isEqual",
          "eq" => "yes",
          "show" => true
        }
      )
    end

    it "generates a FormIO conditional on the panel JSON" do
      block_section_key_map = {
        trigger_block.id => section.key,
        dependent_block.id => section.key
      }
      form_json =
        dependent_block.to_form_json(
          section.key,
          block_conditional: dependent_tsb.conditional,
          block_section_key_map: block_section_key_map
        )

      expect(form_json[:conditional]).to be_present
      expect(form_json[:conditional]["show"]).to eq(true)
      expect(form_json[:conditional]["conjunction"]).to eq("all")
      expect(form_json[:conditional]["conditions"]).to be_an(Array)
      expect(form_json[:conditional]["conditions"].length).to eq(1)
      condition = form_json[:conditional]["conditions"][0]
      expect(condition["component"]).to eq(
        "#{section.key}.formSubmissionDataRST#{section.key}|RB#{trigger_block.id}|my_trigger_field"
      )
      expect(condition["operator"]).to eq("isEqual")
      expect(condition["value"]).to eq("yes")
    end

    it "does not include conditional when block_conditional is nil" do
      form_json = dependent_block.to_form_json(section.key)
      expect(form_json[:conditional]).to be_nil
    end
  end

  describe "RequirementTemplate#to_form_json with block conditional" do
    let(:template) { create(:live_requirement_template) }
    let(:section) do
      create(
        :requirement_template_section,
        requirement_template: template,
        name: "Section A"
      )
    end

    let(:trigger_block) do
      create(:requirement_block, display_name: "Trigger Block")
    end
    let!(:trigger_requirement) do
      create(
        :requirement,
        requirement_block: trigger_block,
        requirement_code: "trigger_field",
        input_type: "checkbox"
      )
    end

    let(:dependent_block) do
      create(:requirement_block, display_name: "Dependent Block")
    end
    let!(:dependent_requirement) do
      create(
        :requirement,
        requirement_block: dependent_block,
        input_type: "text"
      )
    end

    let!(:trigger_tsb) do
      create(
        :template_section_block,
        requirement_template_section: section,
        requirement_block: trigger_block,
        position: 0
      )
    end

    let!(:dependent_tsb) do
      create(
        :template_section_block,
        requirement_template_section: section,
        requirement_block: dependent_block,
        position: 1,
        conditional: {
          "when_block_id" => trigger_block.id,
          "when_requirement_code" => "trigger_field",
          "operator" => "isEqual",
          "eq" => "true",
          "show" => true
        }
      )
    end

    it "includes the resolved conditional in the full form JSON output" do
      form_json = template.to_form_json

      section_component =
        form_json["components"].find { |c| c["id"] == section.id }
      expect(section_component).to be_present

      dependent_panel =
        section_component["components"].find do |c|
          c["id"] == dependent_block.id
        end
      expect(dependent_panel).to be_present
      expect(dependent_panel["conditional"]).to be_present
      expect(dependent_panel["conditional"]["show"]).to eq(true)
      expect(dependent_panel["conditional"]["conjunction"]).to eq("all")
      condition = dependent_panel["conditional"]["conditions"][0]
      expect(condition["value"]).to eq("true")
      expect(condition["operator"]).to eq("isEqual")
      expect(condition["component"]).to include("trigger_field")
      expect(condition["component"]).to include(trigger_block.id)

      trigger_panel =
        section_component["components"].find { |c| c["id"] == trigger_block.id }
      expect(trigger_panel).to be_present
      expect(trigger_panel["conditional"]).to be_nil
    end
  end
end
