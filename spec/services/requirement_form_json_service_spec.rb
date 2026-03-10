require "rails_helper"

RSpec.describe RequirementFormJsonService do
  let(:requirement_block) do
    instance_double("RequirementBlock", key: "block_key")
  end

  def build_requirement(**overrides)
    defaults = {
      id: "req-1",
      label: "Label",
      hint: nil,
      instructions: nil,
      required: false,
      elective: false,
      input_type: "text",
      input_options: {
      },
      requirement_block: requirement_block,
      computed_compliance?: false,
      input_type_general_contact?: false,
      input_type_professional_contact?: false,
      input_type_pid_info?: false,
      input_type_multiply_sum_grid?: false,
      input_type_select?: false,
      input_type_multi_option_select?: false,
      input_type_radio?: false
    }

    attrs = defaults.merge(overrides)

    instance_double(
      "Requirement",
      **attrs,
      key: "req_key",
      key: ->(block_key) { "req_key" },
      input_type: attrs[:input_type],
      input_options: attrs[:input_options]
    )
  end

  describe "#to_form_json" do
    it "returns nil when requirement has no input_type" do
      requirement = build_requirement(input_type: nil)
      allow(requirement).to receive(:input_type).and_return(nil)
      service = described_class.new(requirement)

      expect(service.to_form_json).to be_nil
    end

    it "builds default form json and applies required validation + description/instructions" do
      requirement =
        build_requirement(
          required: true,
          hint: "hint",
          instructions: "instructions",
          input_type: "text"
        )
      allow(requirement).to receive(:key).with("block_key").and_return("x")

      json = described_class.new(requirement).to_form_json("block_key")

      expect(json[:id]).to eq("req-1")
      expect(json[:label]).to eq("Label")
      expect(json[:description]).to eq("hint")
      expect(json[:instructions]).to eq("instructions")
      expect(json.dig(:validate, :required)).to eq(true)
    end

    it "applies data_validation rules (min/max/before/after/allowed_file_types + custom message)" do
      requirement =
        build_requirement(
          input_type: "date",
          input_options: {
            "data_validation" => {
              "operation" => "after",
              "value" => "2026-01-01",
              "error_message" => "bad"
            }
          }
        )
      allow(requirement).to receive(:key).with("block_key").and_return("x")

      json = described_class.new(requirement).to_form_json("block_key")

      expect(json[:enableMinDateInput]).to eq(true)
      expect(json.dig(:validate, :minDate)).to eq("2026-01-01")
      expect(json.dig(:validate, :customMessage)).to eq("bad")
    end

    it "adds select values for select input type" do
      requirement =
        build_requirement(
          input_type: "select",
          input_type_select?: true,
          input_options: {
            "value_options" => [{ "label" => "A", "value" => "a" }]
          }
        )
      allow(requirement).to receive(:key).with("block_key").and_return("x")

      json = described_class.new(requirement).to_form_json("block_key")
      expect(json.dig(:data, :values)).to eq(
        [{ "label" => "A", "value" => "a" }]
      )
    end

    it "filters blank select value options before building json" do
      requirement =
        build_requirement(
          input_type: "select",
          input_type_select?: true,
          input_options: {
            "value_options" => [
              { "label" => "A", "value" => "a" },
              { "label" => "", "value" => "b" },
              { "label" => "C", "value" => "" }
            ]
          }
        )
      allow(requirement).to receive(:key).with("block_key").and_return("x")

      json = described_class.new(requirement).to_form_json("block_key")
      expect(json.dig(:data, :values)).to eq(
        [{ "label" => "A", "value" => "a" }]
      )
    end

    it "appends elective show=false to customConditional when elective" do
      requirement =
        build_requirement(
          elective: true,
          input_options: {
            "customConditional" => "show = true"
          }
        )
      allow(requirement).to receive(:key).with("block_key").and_return("x")

      json = described_class.new(requirement).to_form_json("block_key")
      expect(json[:customConditional]).to include("show = true")
      expect(json[:customConditional]).to include("show = false")
    end

    it "prefixes conditional.when with section + block key" do
      requirement =
        build_requirement(
          input_options: {
            "conditional" => {
              "when" => "abc",
              "eq" => "yes"
            }
          }
        )
      allow(PermitApplication).to receive(:section_from_key).with(
        "block_key"
      ).and_return("section1")
      allow(requirement).to receive(:key).with("block_key").and_return("x")

      json = described_class.new(requirement).to_form_json("block_key")
      expect(json.dig(:conditional, :conditions, 0, :component)).to eq(
        "section1.block_key|abc"
      )
    end

    it "includes the openExistingStepCode action for energy step code" do
      requirement =
        build_requirement(
          input_type: "energy_step_code",
          input_options: {
            "energy_step_code" => "something"
          }
        )
      allow(requirement).to receive(:key).with("block_key").and_return("k1")

      json = described_class.new(requirement).to_form_json("block_key")
      columns = json.dig(:components, 0, :columns) || []
      link_btn =
        columns
          .flat_map { |col| col[:components] || [] }
          .find { |c| c[:custom_class] == "step-code-link-button" }

      expect(json[:energyStepCode]).to eq("something")
      expect(link_btn[:custom]).to include("stepCodeType: 'Part9StepCode'")
      expect(link_btn[:custom]).not_to include("key: 'k1'")
    end

    it "adds computedCompliance payload and tooltip when computed compliance is enabled" do
      requirement =
        build_requirement(
          computed_compliance?: true,
          input_options: {
            "computed_compliance" => {
              "op" => "eq",
              "value" => 1
            }
          }
        )
      allow(requirement).to receive(:key).with("block_key").and_return("x")
      allow(I18n).to receive(:t).with(
        "formio.requirement.auto_compliance.tooltip"
      ).and_return("tip")

      json = described_class.new(requirement).to_form_json("block_key")
      expect(json[:computedCompliance]).to eq({ "op" => "eq", "value" => 1 })
      expect(json[:tooltip]).to eq("tip")
    end

    it "adds values for multi option select and radio input types" do
      requirement =
        build_requirement(
          input_type: "multi_option_select",
          input_type_multi_option_select?: true,
          input_options: {
            "value_options" => [{ "label" => "L", "value" => "v" }]
          }
        )
      allow(requirement).to receive(:key).with("block_key").and_return("x")

      json = described_class.new(requirement).to_form_json("block_key")
      expect(json[:values]).to eq([{ "label" => "L", "value" => "v" }])
    end

    it "builds pid info datagrid when input_type_pid_info? is true" do
      requirement =
        build_requirement(
          input_type: "pid_info",
          input_type_pid_info?: true,
          required: true,
          input_options: {
            "computed_compliance" => {
              "op" => "present"
            }
          }
        )
      allow(requirement).to receive(:key).with("block_key").and_return(
        "pid_key"
      )
      allow(I18n).to receive(:t).with(
        "formio.requirement.auto_compliance.tooltip"
      ).and_return("tip")

      json = described_class.new(requirement).to_form_json("block_key")
      expect(json[:type]).to eq("datagrid")
      expect(json.dig(:components, 0, :type)).to eq("fieldset")
    end

    it "builds multiply/sum grid with versioned keys when configured rows are provided" do
      requirement =
        build_requirement(
          input_type: "multiply_sum_grid",
          input_type_multiply_sum_grid?: true,
          input_options: {
            "rows" => [{ "name" => "Row1", "a" => 1.5 }],
            "headers" => {
              "first_column" => "Item",
              "a" => "Factor",
              "quantity" => "Qty",
              "ab" => "Total"
            }
          }
        )
      allow(requirement).to receive(:key).with("block_key").and_return("ms")
      allow(PermitApplication).to receive(:section_from_key).with(
        "block_key"
      ).and_return("sec")

      json = described_class.new(requirement).to_form_json("block_key")
      datagrid = json.dig(:components, 0)
      expect(json[:type]).to eq("fieldset")
      expect(datagrid[:type]).to eq("datagrid")
      expect(datagrid[:key]).to match(/\|grid\|v/)
      expect(datagrid.dig(:validate, :minLength)).to eq(1)
    end

    it "builds file component with tooltip for energy step code report file key" do
      requirement = build_requirement(input_type: "file", input_options: {})
      allow(requirement).to receive(:key).with("block_key").and_return(
        "x_energy_step_code_report_file"
      )

      json = described_class.new(requirement).to_form_json("block_key")
      expect(json[:type]).to eq("simplefile")
      expect(json[:storage]).to eq("s3custom")
      expect(json[:tooltip]).to eq(
        described_class::ENERGY_STEP_CODE_TOOLTIP_URL
      )
    end

    it "builds general contact fieldset when input type is general contact" do
      requirement =
        build_requirement(
          input_type: "general_contact",
          input_type_general_contact?: true,
          required: true,
          input_options: {
          }
        )
      allow(requirement).to receive(:key).with("block_key").and_return("k1")
      allow(I18n).to receive(:t).and_call_original
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.contact_type_options.general"
      ).and_return({ owner: "Owner" })
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.first_name"
      ).and_return("First name")
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.last_name"
      ).and_return("Last name")
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.email"
      ).and_return("Email")
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.phone"
      ).and_return("Phone")
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.address"
      ).and_return("Address")
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.organization"
      ).and_return("Organization")
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.title"
      ).and_return("Title")
      allow(I18n).to receive(:t).with(
        "formio.requirement_template.autofill_contact"
      ).and_return("Autofill")

      json = described_class.new(requirement).to_form_json("block_key")

      expect(json[:type]).to eq("fieldset")
      expect(json[:components].first[:type]).to eq("button") # autofill button
    end

    it "builds multi contact datagrid when can_add_multiple_contacts is set" do
      requirement =
        build_requirement(
          input_type: "professional_contact",
          input_type_professional_contact?: true,
          required: true,
          input_options: {
            "can_add_multiple_contacts" => true
          }
        )
      allow(requirement).to receive(:key).with("block_key").and_return("k1")
      allow(I18n).to receive(:t).and_call_original
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.add_person_button"
      ).and_return("Add")
      allow(I18n).to receive(:t).with(
        "formio.requirement_template.autofill_contact"
      ).and_return("Autofill")
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.contact_type_options.professional"
      ).and_return({ architect: "Architect" })
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.first_name"
      ).and_return("First name")
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.last_name"
      ).and_return("Last name")
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.email"
      ).and_return("Email")
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.phone"
      ).and_return("Phone")
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.address"
      ).and_return("Address")
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.title"
      ).and_return("Title")
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.business_name"
      ).and_return("Business")
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.business_license"
      ).and_return("License")
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.professional_association"
      ).and_return("Assoc")
      allow(I18n).to receive(:t).with(
        "formio.requirement.contact.professional_number"
      ).and_return("Num")

      json = described_class.new(requirement).to_form_json("block_key")

      expect(json[:type]).to eq("datagrid")
      expect(json[:key]).to include("multi_contact")
    end
  end

  describe "private helpers" do
    it "snake_to_camel and escape_for_js behave as expected" do
      requirement = build_requirement
      service = described_class.new(requirement)

      expect(service.send(:snake_to_camel, "first_name")).to eq("firstName")
      expect(service.send(:escape_for_js, "a'b\\c")).to eq("a\\'b\\\\c")
    end

    it "inject_step_code_existing_link! adds requirement key when link button is at top level" do
      requirement = build_requirement
      service = described_class.new(requirement)

      json = {
        components: [
          {
            type: "button",
            custom_class: "step-code-link-button",
            custom: "original"
          }
        ]
      }

      service.send(
        :inject_step_code_existing_link!,
        json,
        "Part9StepCode",
        "k1"
      )

      expect(json.dig(:components, 0, :custom)).to include("key: 'k1'")
      expect(json.dig(:components, 0, :custom)).to include(
        "stepCodeType: 'Part9StepCode'"
      )
    end
  end
end
