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
            build(
              :requirement,
              input_type: "number",
              input_options: {
                "number_unit" => unit
              }
            )

          expect(number_requirement_with_valid_unit.valid?).to eq(true)
        end
      end

      it "enforces number inputs with invalid unit defined to be invalid" do
        number_requirement_with_invalid_unit =
          build(
            :requirement,
            input_type: "number",
            input_options: {
              "number_unit" => "cmmm"
            }
          )

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
                "value_options" => [1, "test", { "label" => "2", "value" => 2 }]
              }
            )
          valid_requirement =
            build(
              :requirement,
              input_type: type,
              input_options: {
                "value_options" => [
                  { "label" => "1", "value" => "1" },
                  { "label" => "test", "value" => "test" }
                ]
              }
            )

          expect(invalid_requirement).not_to be_valid
          expect(invalid_requirement.errors[:input_options]).to include(
            error_message
          )

          expect(valid_requirement).to be_valid
        end
      end

      context "energy step code related requirements" do
        it "ensures the requirement_code for an energy_step_code input_type is 'energy_step_code_tool_part_9'" do
          valid_requirement = build(:energy_step_code_tool_part_9_requirement)
          invalid_requirement =
            build(
              :requirement,
              input_type: "energy_step_code",
              requirement_code: "energy_step_code_tool_part_8"
            )

          expect(valid_requirement).to be_valid
          expect(invalid_requirement).to_not be_valid
          expect(invalid_requirement.errors[:requirement_code]).to include(
            I18n.t(
              "activerecord.errors.models.requirement.attributes.requirement_code.incorrect_energy_requirement_code",
              correct_requirement_code:
                Requirement::ENERGY_STEP_CODE_REQUIREMENT_CODE,
              incorrect_requirement_code: "energy_step_code_tool_part_8"
            )
          )
        end

        it "ensures energy_step_code_tool_part_9 has correct required schema" do
          valid_requirement = build(:energy_step_code_tool_part_9_requirement)
          invalid_requirements = [
            build(
              :requirement,
              input_type: "energy_step_code",
              requirement_code: "energy_step_code_tool_part_9"
            ),
            build(
              :requirement,
              input_type: "energy_step_code",
              requirement_code: "energy_step_code_tool_part_9",
              input_options: {
                "conditional" => {
                  "eq" => "tool",
                  "show" => true,
                  "when" => "energy_step_code_method_wrong"
                },
                "energy_step_code" => "part_9"
              }
            ),
            build(
              :requirement,
              input_type: "energy_step_code",
              requirement_code: "energy_step_code_tool_part_9",
              input_options: {
                "conditional" => {
                  "eq" => "tool",
                  "show" => true,
                  "when" => "energy_step_code_method"
                }
              }
            )
          ]

          expect(valid_requirement).to be_valid
          invalid_requirements.each do |requirement|
            expect(requirement).to_not be_valid
            expect(requirement.errors[:base]).to include(
              I18n.t(
                "activerecord.errors.models.requirement.incorrect_energy_requirement_schema",
                requirement_code: requirement.requirement_code
              )
            )
          end
        end
      end

      it "ensures energy_step_code_method has correct required schema" do
        valid_requirement = build(:energy_step_code_method_requirement)
        invalid_requirements = [
          build(:requirement, requirement_code: "energy_step_code_tool_part_9"),
          build(
            :requirement,
            input_type: "select",
            requirement_code: "energy_step_code_tool_part_9"
          ),
          build(
            :requirement,
            input_type: "select",
            requirement_code: "energy_step_code_tool_part_9",
            input_options: {
              "value_options" => [
                {
                  "label" => "Utilizing the digital step code tool",
                  "value" => "tool"
                }
              ]
            }
          )
        ]

        expect(valid_requirement).to be_valid
        invalid_requirements.each do |requirement|
          expect(requirement).to_not be_valid
          expect(requirement.errors[:base]).to include(
            I18n.t(
              "activerecord.errors.models.requirement.incorrect_energy_requirement_schema",
              requirement_code: requirement.requirement_code
            )
          )
        end
      end

      it "ensures energy_step_code_report_file has correct required schema" do
        valid_requirement = build(:energy_step_code_report_file_requirement)
        invalid_requirements = [
          build(:requirement, requirement_code: "energy_step_code_report_file"),
          build(
            :requirement,
            input_type: "file",
            requirement_code: "energy_step_code_report_file"
          ),
          build(
            :requirement,
            input_type: "file",
            requirement_code: "energy_step_code_report_file",
            input_options: {
              "value_options" => [
                {
                  "label" => "Utilizing the digital step code tool",
                  "value" => "tool"
                }
              ]
            }
          )
        ]

        expect(valid_requirement).to be_valid
        invalid_requirements.each do |requirement|
          expect(requirement).to_not be_valid
          expect(requirement.errors[:base]).to include(
            I18n.t(
              "activerecord.errors.models.requirement.incorrect_energy_requirement_schema",
              requirement_code: requirement.requirement_code
            )
          )
        end
      end

      it "ensures energy_step_code_h2000_file has correct required schema" do
        valid_requirement = build(:energy_step_code_h2000_file_requirement)
        invalid_requirements = [
          build(:requirement, requirement_code: "energy_step_code_h2000_file"),
          build(
            :requirement,
            input_type: "file",
            requirement_code: "energy_step_code_h2000_file"
          ),
          build(
            :requirement,
            input_type: "file",
            requirement_code: "energy_step_code_h2000_file",
            input_options: {
              "conditional" => {
                "eq" => "file",
                "show" => true
              }
            }
          )
        ]

        expect(valid_requirement).to be_valid
        invalid_requirements.each do |requirement|
          expect(requirement).to_not be_valid
          expect(requirement.errors[:base]).to include(
            I18n.t(
              "activerecord.errors.models.requirement.incorrect_energy_requirement_schema",
              requirement_code: requirement.requirement_code
            )
          )
        end
      end
    end

    context "positions of requirements" do
      it "starts position at 0" do
        requirement =
          FactoryBot.create(
            :requirement_block_with_requirements,
            requirements_count: 1
          )
        expect(requirement.requirements.first.position).to eq(0)
      end

      it "can have duplicate positions when requirements are added to different requirement blocks" do
        requirement_1 =
          FactoryBot.create(
            :requirement_block_with_requirements,
            requirements_count: 1
          )
        requirement_2 =
          FactoryBot.create(
            :requirement_block_with_requirements,
            requirements_count: 1
          )

        expect(requirement_1.requirements.first.position).to eq(0)
        expect(requirement_2.requirements.first.position).to eq(0)
      end

      it "does not have duplicate positions when multiple requirements are added to the same requirement block" do
        requirement_block = create(:requirement_block)
        requirement_1 =
          create(:requirement, requirement_block: requirement_block)
        requirement_2 =
          create(:requirement, requirement_block: requirement_block)

        expect(requirement_1.position).to eq(0)
        expect(requirement_2.position).to eq(1)
      end
    end

    context "files" do
      it "enforces file valid and no additional _file is added to requirement_code if it's already ending in _file for
 file types" do
        code = "test_file"
        file_requirement =
          build(:requirement, requirement_code: code, input_type: "file")
        expect(file_requirement.valid?).to eq(true)
        expect(file_requirement.requirement_code).to eq(code)
      end

      it "enforces file valid and ensures _file is appended to requirement code if it doesn't end with it for file
types" do
        code = "test_incorrect_format"

        file_requirement =
          build(:requirement, requirement_code: code, input_type: "file")

        expect(file_requirement.valid?).to eq(true)
        expect(file_requirement.requirement_code).to eq("#{code}_file")
      end

      it "enforces file valid and ensures _file is appended to requirement code if it includes _file but doesn't end
with it for file
types" do
        code = "test_file_incorrect_format"

        file_requirement =
          build(:requirement, requirement_code: code, input_type: "file")

        expect(file_requirement.valid?).to eq(true)
        expect(file_requirement.requirement_code).to eq("#{code}_file")
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
               date: 5
             )
    end
  end

  describe "methods" do
    it "returns the options for a select input" do
      select_options = [
        { "label" => "1", "value" => "1" },
        { "label" => "test", "value" => "test" }
      ]
      select_requirement =
        create(
          :requirement,
          input_type: "select",
          input_options: {
            "value_options" => select_options
          }
        )

      expect(select_requirement.value_options).to eq(select_options)
    end

    it "camelizes values on input types" do
      select_options = [{ "label" => "test", "value" => "needs_camel" }]
      select_requirement =
        create(
          :requirement,
          input_type: "select",
          input_options: {
            "value_options" => select_options
          }
        )
      camel_select_options = [{ "label" => "test", "value" => "needsCamel" }]
      expect(select_requirement.value_options).to eq(camel_select_options)
    end

    it "removes spaces from values on input types" do
      select_options = [{ "label" => "test", "value" => "needs trim" }]
      select_requirement =
        create(
          :requirement,
          input_type: "select",
          input_options: {
            "value_options" => select_options
          }
        )
      formatted_select_options = [{ "label" => "test", "value" => "needsTrim" }]
      expect(select_requirement.value_options).to eq(formatted_select_options)
    end

    it "removes spaces and camelizes values on input types" do
      select_options = [{ "label" => "test", "value" => "new option_2" }]
      select_requirement =
        create(
          :requirement,
          input_type: "select",
          input_options: {
            "value_options" => select_options
          }
        )
      formatted_select_options = [
        { "label" => "test", "value" => "newOption2" }
      ]
      expect(select_requirement.value_options).to eq(formatted_select_options)
    end

    it "returns the number unit for number input with a unit" do
      number_unit = "m"
      number_requirement_with_unit =
        create(
          :requirement,
          input_type: "number",
          input_options: {
            "number_unit" => number_unit
          }
        )
      number_requirement_without_unit =
        create(:requirement, input_type: "number")

      expect(number_requirement_with_unit.number_unit).to eq(number_unit)
      expect(number_requirement_without_unit.number_unit).to eq(nil)
    end

    context "form json" do
      it "returns correct form json for text requirement" do
        requirement =
          create(
            :requirement,
            requirement_code: "text_requirement",
            label: "Text Requirement",
            input_type: "text"
          )
        form_json = requirement.to_form_json.reject { |key| key == :id }
        expected_form_json = {
          key:
            "#{requirement.requirement_block.key}|#{requirement.requirement_code}",
          requirementInputType: "text",
          type: "simpletextfield",
          input: true,
          label: "Text Requirement",
          widget: {
            type: "input"
          }
        }

        expect(form_json).to eq(expected_form_json)
      end

      it "returns correct form json for number requirement" do
        requirement =
          create(
            :requirement,
            label: "Number Requirement",
            input_type: "number"
          )
        form_json = requirement.to_form_json.reject { |key| key == :id }
        expected_form_json = {
          key: "#{requirement.requirement_block.key}|number_requirement",
          type: "number",
          delimiter: true,
          input: true,
          label: "Number Requirement",
          widget: {
            type: "input"
          },
          applyMaskOn: "change",
          mask: false,
          requirementInputType: "number",
          inputFormat: "plain"
        }

        expect(form_json).to eq(expected_form_json)
      end

      it "returns correct form json for checkbox requirement" do
        requirement =
          create(
            :requirement,
            label: "Checkbox Requirement",
            input_type: "checkbox"
          )
        form_json = requirement.to_form_json.reject { |key| key == :id }
        expected_form_json = {
          key: "#{requirement.requirement_block.key}|checkbox_requirement",
          type: "checkbox",
          input: true,
          label: "Checkbox Requirement",
          requirementInputType: "checkbox",
          widget: {
            type: "input"
          }
        }

        expect(form_json).to eq(expected_form_json)
      end

      it "returns correct form json for date requirement" do
        requirement =
          create(:requirement, label: "Date  Requirement", input_type: "date")
        form_json = requirement.to_form_json.reject { |key| key == :id }
        expected_form_json = {
          key: "#{requirement.requirement_block.key}|date_requirement",
          type: "datetime",
          tableView: false,
          input: true,
          label: "Date  Requirement",
          requirementInputType: "date",
          enableTime: false,
          datePicker: {
            disableWeekends: false,
            disableWeekdays: false
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
            enableTime: false,
            noCalendar: false,
            format: "yyyy-MM-dd",
            hourIncrement: 1,
            minuteIncrement: 1,
            time_24hr: false,
            minDate: nil,
            disableWeekends: false,
            disableWeekdays: false,
            maxDate: nil
          }
        }

        expect(form_json).to eq(expected_form_json)
      end

      it "returns correct form json for select requirement" do
        select_options = [
          { "label" => "1", "value" => "1" },
          { "label" => "test", "value" => "test" }
        ]
        requirement =
          create(
            :requirement,
            label: "select Requirement",
            input_type: "select",
            input_options: {
              "value_options" => select_options
            }
          )
        form_json = requirement.to_form_json.reject { |key| key == :id }
        expected_form_json = {
          key: "#{requirement.requirement_block.key}|select_requirement",
          type: "select",
          input: true,
          label: "select Requirement",
          requirementInputType: "select",
          widget: {
            type: "choicesjs"
          },
          data: {
            values: select_options
          }
        }

        expect(form_json).to eq(expected_form_json)
      end

      it "returns correct form json for multi option select requirement" do
        select_options = [
          { "label" => "1", "value" => "1" },
          { "label" => "test", "value" => "test" }
        ]
        requirement =
          create(
            :requirement,
            label: "Multi option select Requirement",
            input_type: "multi_option_select",
            input_options: {
              "value_options" => select_options
            }
          )
        form_json = requirement.to_form_json.reject { |key| key == :id }
        expected_form_json = {
          input: true,
          inputType: "checkbox",
          key:
            "#{requirement.requirement_block.key}|multi_option_select_requirement",
          label: "Multi option select Requirement",
          optionsLabelPosition: "right",
          requirementInputType: "multi_option_select",
          tableView: false,
          type: "selectboxes",
          widget: {
            type: "input"
          },
          optionsLabelPosition: "right",
          values: select_options
        }

        expect(form_json).to eq(expected_form_json)
      end

      it "returns correct form json for file requirement" do
        requirement =
          create(:requirement, label: "File Requirement", input_type: "file")
        form_json = requirement.to_form_json.reject { |key| key == :id }
        expected_form_json = {
          key: "#{requirement.requirement_block.key}|file_requirement_file",
          storage: "s3custom",
          type: "simplefile",
          custom_class: "formio-component-file",
          input: true,
          label: "File Requirement",
          requirementInputType: "file",
          widget: {
            type: "input"
          }
        }

        expect(form_json).to eq(expected_form_json)
      end

      context "electives" do
        it "returns a hidden field for an elective requirement" do
          requirement =
            create(
              :requirement,
              requirement_code: "text_requirement",
              label: "Text Requirement",
              input_type: "text",
              elective: true
            )
          form_json = requirement.to_form_json.reject { |key| key == :id }
          expected_form_json = {
            key:
              "#{requirement.requirement_block.key}|#{requirement.requirement_code}",
            requirementInputType: "text",
            type: "simpletextfield",
            elective: true,
            input: true,
            label: "Text Requirement",
            widget: {
              type: "input"
            },
            customConditional: ";show = false"
          }
          expect(form_json).to eq(expected_form_json)
        end

        it "merges the show condition for an elective with other conditional logic" do
          requirement_block = create(:requirement_block)
          create(
            :requirement,
            requirement_block: requirement_block,
            requirement_code: "test",
            label: "Test",
            input_type: "text"
          )

          requirement =
            create(
              :requirement,
              requirement_block: requirement_block,
              requirement_code: "text_requirement",
              label: "Text Requirement",
              input_type: "text",
              elective: true,
              input_options: {
                "conditional" => {
                  show: true,
                  when: "test",
                  eq: "customValue"
                }
              }
            )
          form_json = requirement.to_form_json.reject { |key| key == :id }
          expected_form_json = {
            key:
              "#{requirement.requirement_block.key}|#{requirement.requirement_code}",
            type: "simpletextfield",
            elective: true,
            input: true,
            label: "Text Requirement",
            widget: {
              type: "input"
            },
            conditional: {
              show: true,
              when: "test",
              eq: "customValue"
            },
            customConditional: ";show = false"
          }
        end

        it "merges the show condition for an elective with customConditional" do
          requirement =
            create(
              :requirement,
              requirement_code: "text_requirement",
              label: "Text Requirement",
              input_type: "text",
              elective: true,
              input_options: {
                "customConditional" => "show = true"
              }
            )
          form_json = requirement.to_form_json.reject { |key| key == :id }
          expected_form_json = {
            key:
              "#{requirement.requirement_block.key}|#{requirement.requirement_code}",
            type: "simpletextfield",
            elective: true,
            input: true,
            label: "Text Requirement",
            widget: {
              type: "input"
            },
            customConditional: "show = true;show = false"
          }
        end
      end

      context "validations" do
        it "returns a validation for required if it is a required field" do
        end
      end
    end
  end
end
