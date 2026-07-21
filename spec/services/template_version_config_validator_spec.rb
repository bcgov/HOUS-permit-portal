require "rails_helper"

RSpec.describe TemplateVersionConfigValidator, type: :service do
  let(:requirement_blocks_json) do
    {
      "trigger-block" => {
        "id" => "trigger-block",
        "name" => "Trigger block",
        "requirements" => [
          {
            "id" => "trigger-field",
            "label" => "Trigger choice",
            "requirement_code" => "trigger_choice",
            "input_type" => "select",
            "input_options" => {
              "value_options" => [
                { "label" => "Yes", "value" => "yes" },
                { "label" => "No", "value" => "no" }
              ]
            }
          }
        ]
      },
      "dependent-block" => {
        "id" => "dependent-block",
        "name" => "Dependent block",
        "requirements" => [
          {
            "id" => "local-trigger-field",
            "label" => "Local trigger choice",
            "requirement_code" => "trigger_choice",
            "input_type" => "select",
            "input_options" => {
              "value_options" => [
                { "label" => "Yes", "value" => "yes" },
                { "label" => "No", "value" => "no" }
              ]
            }
          },
          {
            "id" => "dependent-field",
            "label" => "Dependent field",
            "requirement_code" => "dependent_field",
            "input_type" => "text",
            "input_options" => {
              "conditional" => {
                "when" => "trigger_choice",
                "operator" => "isEqual",
                "eq" => "yes",
                "show" => true
              }
            }
          }
        ]
      }
    }
  end

  let(:denormalized_template_json) do
    {
      "requirement_template_sections" => [
        {
          "template_section_blocks" => [
            {
              "requirement_block" => {
                "id" => "trigger-block"
              },
              "conditional" => nil
            },
            {
              "requirement_block" => {
                "id" => "dependent-block"
              },
              "conditional" => nil
            }
          ]
        }
      ]
    }
  end

  subject(:validate!) do
    described_class.new(
      requirement_blocks_json: requirement_blocks_json,
      denormalized_template_json: denormalized_template_json
    ).validate!
  end

  it "accepts a valid snapshot" do
    expect(validate!).to be(true)
  end

  it "rejects a field conditional whose value is no longer an option" do
    conditional =
      requirement_blocks_json.dig(
        "dependent-block",
        "requirements",
        1,
        "input_options",
        "conditional"
      )
    conditional["eq"] = "removed"

    expect { validate! }.to raise_error(
      TemplateVersionConfigError,
      /conditional value "removed" is not an option/
    )
  end

  it "rejects data validation that is incompatible with the field type" do
    input_options =
      requirement_blocks_json.dig(
        "dependent-block",
        "requirements",
        1,
        "input_options"
      )
    input_options["data_validation"] = { "operation" => "min", "value" => 1 }

    expect { validate! }.to raise_error(
      TemplateVersionConfigError,
      /data validation is not allowed for "text" inputs/
    )
  end

  it "rejects automated compliance that is incompatible with the field type" do
    input_options =
      requirement_blocks_json.dig(
        "dependent-block",
        "requirements",
        1,
        "input_options"
      )
    input_options["computed_compliance"] = {
      "module" => "DigitalSealValidator",
      "trigger" => "on_save",
      "value_on" => "compliance_data"
    }

    expect { validate! }.to raise_error(
      TemplateVersionConfigError,
      /automated compliance.*not compatible/i
    )
  end

  it "rejects a block conditional whose value is no longer an option" do
    placement =
      denormalized_template_json.dig(
        "requirement_template_sections",
        0,
        "template_section_blocks",
        1
      )
    placement["conditional"] = {
      "when_block_id" => "trigger-block",
      "when_requirement_code" => "trigger_choice",
      "operator" => "isEqual",
      "eq" => "removed",
      "show" => true
    }

    expect { validate! }.to raise_error(
      TemplateVersionConfigError,
      /conditional value "removed" is not an option/
    )
  end
end
