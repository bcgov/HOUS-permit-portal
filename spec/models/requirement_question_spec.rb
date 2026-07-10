require "rails_helper"

RSpec.describe RequirementQuestion, type: :model do
  describe "associations" do
    it { should have_many(:requirements).dependent(:restrict_with_error) }
    it { should have_many(:requirement_blocks).through(:requirements) }
  end

  describe "semantic code generation" do
    it "parameterizes the label when requirement_code is blank" do
      question =
        build(
          :requirement_question,
          label: "Property Owner Name",
          requirement_code: nil
        )

      question.valid?

      expect(question.requirement_code).to eq("property_owner_name")
    end

    it "does not overwrite an existing requirement_code" do
      question =
        build(
          :requirement_question,
          label: "Something Else",
          requirement_code: "legacy_api_key"
        )

      question.valid?

      expect(question.requirement_code).to eq("legacy_api_key")
    end
  end

  describe "convert_value_options" do
    it "skips conversion for private questions" do
      question =
        build(
          :requirement_question,
          shared: false,
          input_type: "select",
          input_options: {
            "value_options" => [
              { "label" => "New Construction", "value" => "New Construction" }
            ]
          }
        )

      question.valid?

      expect(question.input_options["value_options"].first["value"]).to eq(
        "New Construction"
      )
    end

    it "converts values and options_map for shared questions" do
      question =
        build(
          :requirement_question,
          shared: true,
          input_type: "select",
          input_options: {
            "value_options" => [
              { "label" => "New Construction", "value" => "New Construction" },
              { "label" => "Renovation", "value" => "Renovation" }
            ],
            "computed_compliance" => {
              "module" => "HistoricSite",
              "options_map" => {
                "Y" => "New Construction",
                "N" => "Renovation"
              }
            }
          }
        )

      expect(question).to be_valid
      expect(
        question.input_options["value_options"].map { |o| o["value"] }
      ).to eq(%w[newConstruction renovation])
      expect(
        question.input_options.dig("computed_compliance", "options_map")
      ).to eq({ "Y" => "newConstruction", "N" => "renovation" })
    end
  end
end
