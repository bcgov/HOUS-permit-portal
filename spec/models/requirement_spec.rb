require "rails_helper"

RSpec.describe Requirement, type: :model do
  describe "associations" do
    # Testing direct associations
    it { should belong_to(:requirement_block) }
  end

  describe "validations" do
    context "number inputs" do
      it "enforces number inputs are valid without a unit" do
        number_requirement = build(:requirement, input_type: "number")

        expect(number_requirement.valid?).to eq(true)
      end

      it "enforces number inputs with valid unit defined to be valid" do
        Requirement::NUMBER_UNITS.each do |unit|
          number_requirement_with_valid_unit =
            build(:requirement, input_type: "number", input_options: { "number_unit" => unit })

          expect(number_requirement_with_valid_unit.valid?).to eq(true)
        end
      end

      it "enforces number inputs with invalid unit defined to be invalid" do
        number_requirement_with_invalid_unit =
          build(:requirement, input_type: "number", input_options: { "number_unit" => "cmmm" })

        expect(number_requirement_with_invalid_unit.valid?).to eq(false)
      end
    end

    context "types with value options" do
      it "enforces types with value options has defined accepted options" do
        error_message = "must have value options defined"

        Requirement::TYPES_WITH_VALUE_OPTIONS.each do |type|
          requirement = build(:requirement, input_type: type)

          expect(requirement).not_to be_valid
          expect(requirement.errors[:input_options]).to include(error_message)
        end

        text_requirement = build(:requirement, input_type: "text")

        expect(text_requirement).to be_valid
      end

      it "enforces types with value options to have string options" do
        error_message = "must have value options defined"

        Requirement::TYPES_WITH_VALUE_OPTIONS.each do |type|
          invalid_requirement =
            build(
              :requirement,
              input_type: type,
              input_options: {
                "value_options" => [1, "test", { "label" => "2", "value" => 2 }],
              },
            )
          valid_requirement =
            build(
              :requirement,
              input_type: type,
              input_options: {
                "value_options" => [{ "label" => "1", "value" => "1" }, { "label" => "test", "value" => "test" }],
              },
            )

          expect(invalid_requirement).not_to be_valid
          expect(invalid_requirement.errors[:input_options]).to include(error_message)

          expect(valid_requirement).to be_valid
        end
      end
    end

    context "positions of requirements" do
      it "starts position at 0" do
        requirement = FactoryBot.create(:requirement_block_with_requirements, requirements_count: 1)
        expect(requirement.requirements.first.position).to eq(0)
      end

      it "can have duplicate positions when requirements are added to different requirement blocks" do
        requirement_1 = FactoryBot.create(:requirement_block_with_requirements, requirements_count: 1)
        requirement_2 = FactoryBot.create(:requirement_block_with_requirements, requirements_count: 1)

        expect(requirement_1.requirements.first.position).to eq(0)
        expect(requirement_2.requirements.first.position).to eq(0)
      end

      it "does not have duplicate positions when multiple requirements are added to the same requirement block" do
        requirement_block = create(:requirement_block)
        requirement_1 = create(:requirement, requirement_block: requirement_block)
        requirement_2 = create(:requirement, requirement_block: requirement_block)

        expect(requirement_1.position).to eq(0)
        expect(requirement_2.position).to eq(1)
      end
    end

    context "files" do
      it "enforces number inputs are valid without a unit" do
        file_requirement = build(:requirement, requirement_code: "test_file", input_type: "file")
        expect(file_requirement.valid?).to eq(true)
      end

      it "enforces number inputs are valid without a unit" do
        file_requirement = build(:requirement, requirement_code: "test_fail", input_type: "file")
        expect(file_requirement.valid?).to eq(false)
      end
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

    it "returns the number unit for number input with a unit" do
      number_unit = "m"
      number_requirement_with_unit =
        create(:requirement, input_type: "number", input_options: { "number_unit" => number_unit })
      number_requirement_without_unit = create(:requirement, input_type: "number")

      expect(number_requirement_with_unit.number_unit).to eq(number_unit)
      expect(number_requirement_without_unit.number_unit).to eq(nil)
    end

    context "form json" do
      it "returns correct form json for text requirement" do
        requirement =
          create(:requirement, requirement_code: "text_requirement", label: "Text Requirement", input_type: "text")
        form_json = requirement.to_form_json.reject { |key| key == :id }
        expected_form_json = {
          key: "#{requirement.requirement_block.key}|#{requirement.requirement_code}",
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
          key: "#{requirement.requirement_block.key}|numberRequirement",
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
        options = [{ "label" => "1", "value" => "1" }, { "label" => "test", "value" => "test" }]
        requirement =
          create(
            :requirement,
            label: "Checkbox Requirement",
            input_type: "checkbox",
            input_options: {
              "value_options" => options,
            },
          )
        form_json = requirement.to_form_json.reject { |key| key == :id }
        expected_form_json = {
          key: "#{requirement.requirement_block.key}|checkboxRequirement",
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
          key: "#{requirement.requirement_block.key}|dateRequirement",
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
          key: "#{requirement.requirement_block.key}|selectRequirement",
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
          key: "#{requirement.requirement_block.key}|multiOptionSelectRequirement",
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
