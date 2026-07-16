require "rails_helper"

RSpec.describe RequirementQuestion, type: :model do
  describe "associations" do
    it { should have_many(:requirements).dependent(:restrict_with_error) }
    it { should have_many(:requirement_blocks).through(:requirements) }
  end

  describe "validations" do
    it "requires name for shared questions" do
      question = build(:requirement_question, :shared, name: nil)

      expect(question).not_to be_valid
      expect(question.errors[:name]).to be_present
    end

    it "limits description to 250 characters" do
      question = build(:requirement_question, :shared, description: "a" * 251)

      expect(question).not_to be_valid
      expect(question.errors[:description]).to be_present
    end

    it "rejects conditional on shared questions" do
      question =
        build(
          :requirement_question,
          :shared,
          input_options: {
            "conditional" => {
              "when" => "other_field",
              "eq" => "yes"
            }
          }
        )

      expect(question).not_to be_valid
      expect(question.errors[:input_options]).to be_present
    end

    it "allows conditional on private questions" do
      question =
        build(
          :requirement_question,
          shared: false,
          input_options: {
            "conditional" => {
              "when" => "other_field",
              "eq" => "yes"
            }
          }
        )

      expect(question).to be_valid
    end
  end

  describe "requirement_code generation" do
    it "parameterizes the label for private questions" do
      question =
        build(
          :requirement_question,
          label: "Property Owner Name",
          requirement_code: nil
        )

      question.valid?

      expect(question.requirement_code).to eq("property_owner_name")
    end

    it "uuid-scopes the code for shared questions" do
      id = SecureRandom.uuid
      question =
        build(
          :requirement_question,
          :shared,
          id: id,
          label: "Property Owner Name",
          requirement_code: nil
        )

      question.valid?

      expect(question.requirement_code).to eq("#{id}:property_owner_name")
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

    it "gives different codes to shared questions with the same label" do
      first =
        create(
          :requirement_question,
          :shared,
          label: "Same Label",
          requirement_code: nil
        )
      second =
        create(
          :requirement_question,
          :shared,
          label: "Same Label",
          requirement_code: nil
        )

      expect(first.requirement_code).to eq("#{first.id}:same_label")
      expect(second.requirement_code).to eq("#{second.id}:same_label")
      expect(first.requirement_code).not_to eq(second.requirement_code)
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
          :shared,
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
