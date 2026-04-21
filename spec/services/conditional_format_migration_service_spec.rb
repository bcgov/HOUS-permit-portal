# frozen_string_literal: true

require "rails_helper"

RSpec.describe ConditionalFormatMigrationService, type: :service do
  subject(:service) { described_class.new }

  describe "#convert_component_conditionals" do
    it "converts a legacy conditional with show" do
      component = {
        "conditional" => {
          "when" => "field_a",
          "eq" => "yes",
          "show" => true
        }
      }

      expect(service.convert_component_conditionals(component)).to be true
      expect(component["conditional"]).to eq(
        "show" => true,
        "conjunction" => "all",
        "conditions" => [
          {
            "component" => "field_a",
            "operator" => "isEqual",
            "value" => "yes"
          }
        ]
      )
    end

    it "converts a legacy conditional with hide" do
      component = {
        "conditional" => {
          "when" => "field_b",
          "eq" => "no",
          "hide" => true
        }
      }

      expect(service.convert_component_conditionals(component)).to be true
      expect(component["conditional"]["show"]).to eq(false)
      expect(component["conditional"]["conditions"].first["component"]).to eq(
        "field_b"
      )
    end

    it "does not touch a component without a conditional" do
      component = { "type" => "textfield", "key" => "name" }
      expect(service.convert_component_conditionals(component)).to be false
      expect(component).to eq("type" => "textfield", "key" => "name")
    end

    it "does not touch a conditional that has no 'when' key" do
      component = { "conditional" => { "show" => false } }
      expect(service.convert_component_conditionals(component)).to be false
      expect(component["conditional"]).to eq("show" => false)
    end

    it "recursively converts nested components" do
      tree = {
        "components" => [
          { "conditional" => { "when" => "a", "eq" => "1", "show" => true } },
          {
            "type" => "panel",
            "components" => [
              {
                "conditional" => {
                  "when" => "b",
                  "eq" => "2",
                  "hide" => true
                }
              }
            ]
          }
        ]
      }

      expect(service.convert_component_conditionals(tree)).to be true

      first = tree["components"][0]["conditional"]
      expect(first["conjunction"]).to eq("all")
      expect(first["conditions"].first["component"]).to eq("a")

      nested = tree["components"][1]["components"][0]["conditional"]
      expect(nested["show"]).to eq(false)
      expect(nested["conditions"].first["component"]).to eq("b")
    end

    it "returns false for a nil input" do
      expect(service.convert_component_conditionals(nil)).to be false
    end

    it "returns false for a non-hash input" do
      expect(service.convert_component_conditionals("string")).to be false
    end
  end

  describe "#migrate_requirement_source_data" do
    it "adds operator to requirements missing one" do
      block = create(:requirement_block)
      req =
        create(
          :requirement,
          requirement_block: block,
          input_type: "select",
          input_options: {
            "conditional" => {
              "when" => "other_field",
              "eq" => "yes",
              "show" => true
            },
            "value_options" => [
              { "label" => "Yes", "value" => "yes" },
              { "label" => "No", "value" => "no" }
            ]
          }
        )

      count = service.migrate_requirement_source_data

      expect(count).to eq(1)
      req.reload
      expect(req.input_options["conditional"]["operator"]).to eq("isEqual")
    end

    it "skips requirements that already have a valid operator" do
      block = create(:requirement_block)
      create(
        :requirement,
        requirement_block: block,
        input_type: "number",
        input_options: {
          "conditional" => {
            "when" => "num_field",
            "eq" => "5",
            "show" => true,
            "operator" => "greaterThan"
          }
        }
      )

      count = service.migrate_requirement_source_data
      expect(count).to eq(0)
    end

    it "skips requirements without a conditional" do
      block = create(:requirement_block)
      create(
        :requirement,
        requirement_block: block,
        input_type: "text",
        input_options: {
        }
      )

      count = service.migrate_requirement_source_data
      expect(count).to eq(0)
    end
  end

  describe "#migrate_template_version_form_json" do
    it "converts legacy conditionals in stored form_json" do
      tv =
        create(
          :template_version,
          form_json: {
            "components" => [
              {
                "type" => "panel",
                "components" => [
                  {
                    "type" => "textfield",
                    "key" => "name",
                    "conditional" => {
                      "when" => "toggle",
                      "eq" => "true",
                      "show" => true
                    }
                  }
                ]
              }
            ]
          }
        )

      count = service.migrate_template_version_form_json

      expect(count).to eq(1)
      tv.reload
      cond = tv.form_json["components"][0]["components"][0]["conditional"]
      expect(cond["conjunction"]).to eq("all")
      expect(cond["conditions"].first).to eq(
        "component" => "toggle",
        "operator" => "isEqual",
        "value" => "true"
      )
    end

    it "skips template versions with no legacy conditionals" do
      create(
        :template_version,
        form_json: {
          "components" => [{ "type" => "textfield", "key" => "name" }]
        }
      )

      count = service.migrate_template_version_form_json
      expect(count).to eq(0)
    end

    it "skips template versions with empty form_json" do
      create(:template_version, form_json: {})

      count = service.migrate_template_version_form_json
      expect(count).to eq(0)
    end
  end

  describe "#call" do
    it "returns a result with counts for both operations" do
      block = create(:requirement_block)
      create(
        :requirement,
        requirement_block: block,
        input_type: "radio",
        input_options: {
          "conditional" => {
            "when" => "q1",
            "eq" => "a",
            "show" => true
          },
          "value_options" => [
            { "label" => "Option A", "value" => "a" },
            { "label" => "Option B", "value" => "b" }
          ]
        }
      )
      create(
        :template_version,
        form_json: {
          "components" => [
            { "conditional" => { "when" => "x", "eq" => "y", "show" => true } }
          ]
        }
      )

      result = service.call

      expect(result.requirements_updated).to eq(1)
      expect(result.template_versions_updated).to eq(1)
    end
  end
end
