require "rails_helper"

RSpec.describe Requirement, type: :model do
  describe "associations" do
    # Testing direct associations
    it { should have_many(:requirement_block_requirements) }
    it { should have_many(:requirement_blocks).through(:requirement_block_requirements) }
  end

  describe "validations" do
    it "enforces select inputs has defined accepted options" do
      select_requirement = build(:requirement, input_type: "select")
      multi_option_select_requirement = build(:requirement, input_type: "multi_option_select")
      text_requirement = build(:requirement, input_type: "text")
      error_message = "select inputs must have options defined"

      expect(select_requirement).not_to be_valid
      expect(select_requirement.errors[:input_options]).to include(error_message)
      expect(multi_option_select_requirement).not_to be_valid
      expect(multi_option_select_requirement.errors[:input_options]).to include(error_message)
      expect(text_requirement).to be_valid
    end

    it "enforces select inputs to have string options" do
      invalid_select_requirement =
        build(
          :requirement,
          input_type: "select",
          input_options: {
            "value_options" => [1, "test", { "label" => "2", "value" => 2 }],
          },
        )
      valid_select_requirement =
        build(
          :requirement,
          input_type: "select",
          input_options: {
            "value_options" => [{ "label" => "1", "value" => "1" }, { "label" => "test", "value" => "test" }],
          },
        )
      error_message = "select inputs must have options defined"

      expect(invalid_select_requirement).not_to be_valid
      expect(invalid_select_requirement.errors[:input_options]).to include(error_message)

      expect(valid_select_requirement).to be_valid
    end
  end

  describe "enums" do
    # TODO: remove xit tests when initial input types are finalized
    xit do
      should define_enum_for(:input_type).with_prefix(true).with_values(
               text: 0,
               number: 1,
               checkbox: 2,
               select: 3,
               multi_option_select: 4,
               date: 5,
             )
    end
  end

  describe "methods" do
    it "returns the options for a select input" do
      select_options = [{ "label" => "1", "value" => "1" }, { "label" => "test", "value" => "test" }]
      select_requirement =
        create(:requirement, input_type: "select", input_options: { "value_options" => select_options })

      expect(select_requirement.value_options).to eq(select_options)
    end

    context "form json" do
      it "returns correct form json for text requirement" do
        requirement = create(:requirement, label: "Text Requirement", input_type: "text")
        form_json = requirement.to_form_json.reject { |key| key == :id }
        expected_form_json = {
          key: "textRequirement",
          type: "simpletextfield",
          input: true,
          label: "Text Requirement",
          widget: {
            type: "input",
          },
        }

        expect(form_json).to eq(expected_form_json)
      end

      it "returns correct form json for number requirement" do
        requirement = create(:requirement, label: "Number Requirement", input_type: "number")
        form_json = requirement.to_form_json.reject { |key| key == :id }
        expected_form_json = {
          key: "numberRequirement",
          type: "number",
          input: true,
          label: "Number Requirement",
          widget: {
            type: "input",
          },
          applyMaskOn: "change",
          mask: false,
          inputFormat: "plain",
        }

        expect(form_json).to eq(expected_form_json)
      end

      it "returns correct form json for checkbox requirement" do
        requirement = create(:requirement, label: "Checkbox Requirement", input_type: "checkbox")
        form_json = requirement.to_form_json.reject { |key| key == :id }
        expected_form_json = {
          key: "checkboxRequirement",
          type: "checkbox",
          input: true,
          label: "Checkbox Requirement",
          widget: {
            type: "input",
          },
        }

        expect(form_json).to eq(expected_form_json)
      end

      it "returns correct form json for date requirement" do
        requirement = create(:requirement, label: "Date  Requirement", input_type: "date")
        form_json = requirement.to_form_json.reject { |key| key == :id }
        expected_form_json = {
          key: "dateRequirement",
          type: "date",
          input: true,
          label: "Date  Requirement",
          enableTime: false,
          datePicker: {
            disableWeekends: false,
            disableWeekdays: false,
          },
          enableMinDateInput: false,
          enableMaxDateInput: false,
          widget: {
            type: "calendar",
            displayInTimezone: "viewer",
            locale: "en",
            useLocaleSettings: false,
            allowInput: true,
            mode: "single",
            enableTime: true,
            noCalendar: false,
            format: "yyyy-MM-dd",
            hourIncrement: 1,
            minuteIncrement: 1,
            time_24hr: false,
            minDate: nil,
            disableWeekends: false,
            disableWeekdays: false,
            maxDate: nil,
          },
        }

        expect(form_json).to eq(expected_form_json)
      end

      it "returns correct form json for select requirement" do
        select_options = [{ "label" => "1", "value" => "1" }, { "label" => "test", "value" => "test" }]
        requirement =
          create(
            :requirement,
            label: "select Requirement",
            input_type: "select",
            input_options: {
              "value_options" => select_options,
            },
          )
        form_json = requirement.to_form_json.reject { |key| key == :id }
        expected_form_json = {
          key: "selectRequirement",
          type: "select",
          input: true,
          label: "select Requirement",
          widget: {
            type: "choicesjs",
          },
          data: {
            values: select_options,
          },
        }

        expect(form_json).to eq(expected_form_json)
      end

      it "returns correct form json for multi option select requirement" do
        select_options = [{ "label" => "1", "value" => "1" }, { "label" => "test", "value" => "test" }]
        requirement =
          create(
            :requirement,
            label: "Multi option select Requirement",
            input_type: "multi_option_select",
            input_options: {
              "value_options" => select_options,
            },
          )
        form_json = requirement.to_form_json.reject { |key| key == :id }
        expected_form_json = {
          key: "multiOptionSelectRequirement",
          type: "select",
          input: true,
          multiple: true,
          label: "Multi option select Requirement",
          widget: {
            type: "choicesjs",
          },
          data: {
            values: select_options,
          },
        }

        expect(form_json).to eq(expected_form_json)
      end
    end
  end
end
