require "rails_helper"

RSpec.describe RequirementBlock, type: :model do
  describe "associations" do
    # Testing direct associations
    it { should have_many(:requirements) }
    it "should order requirements by position in ascending order" do
      requirement_block =
        FactoryBot.create(
          :requirement_block_with_requirements,
          requirements_count: 6
        )

      # This is so that the order is not tied to create order, because by default it returns associations
      # in update order we might get a false positive test, where the position seems correct
      # due to being inserted in order.

      first_requirement = requirement_block.requirements.first

      first_requirement.position = 3
      first_requirement.save

      requirement_block.reload

      requirement_block.requirements.each_with_index do |r, i|
        expect(r.position).to eq(i)
      end
    end
  end

  describe "enums" do
    it do
      should define_enum_for(:sign_off_role).with_prefix(true).with_values(
               any: 0
             )
    end
    it do
      should define_enum_for(:reviewer_role).with_prefix(true).with_values(
               any: 0
             )
    end
  end

  describe "methods" do
    it "returns the form json with with all requirements" do
      requirement_block =
        FactoryBot.create(
          :requirement_block_with_requirements,
          requirements_count: 6
        )
      form_json = requirement_block.to_form_json
      expect(form_json.reject { |key| key === :components }).to eq (
           {
             id: requirement_block.id,
             key: requirement_block.key,
             title: requirement_block.name,
             description: nil,
             type: "panel",
             collapsible: true,
             collapsed: false,
             description: nil
           }
         )
      # expect 7 because a block that is all optional requirements gets one extra required component
      expect(form_json[:components].count).to eq 7
    end
  end

  describe "validations" do
    let!(:existing_block) { create(:requirement_block, sku: "existing_value") }

    context "sku" do
      it "validates uniqueness of sku" do
        new_block = build(:requirement_block, sku: existing_block.sku)
        expect(new_block).not_to be_valid
        expect(new_block.errors[:sku]).to include("has already been taken")
      end

      it "auto generates human readable sku when not supplied" do
        new_block = build(:requirement_block, name: "Test Name")

        expect(new_block).to be_valid
        expect(new_block.sku).to eq("test_name")
      end

      it "auto generates unique human readable sku when not supplied" do
        new_block = create(:requirement_block, name: "Test Name")
        new_block_with_name_clash =
          build(:requirement_block, name: "Test Name ") # has an extra space

        expect(new_block).to be_valid
        expect(new_block.sku).to eq("test_name")

        expect(new_block_with_name_clash).to be_valid
        expect(new_block_with_name_clash.sku).to start_with("test_name_")
      end
    end

    it "validates presence of sku" do
      new_block = create(:requirement_block, sku: nil)
      expect(new_block.sku).to be_present
    end

    context "when the block has an energy step code requirement" do
      it "validate it has exactly one of each required requirement dependencies with expected requirement_codes" do
        valid_block = create(:valid_energy_step_code_requirement_block)
        invalid_blocks = [
          build(
            :requirement_block,
            requirements_attributes: [
              {
                "requirement_code" => "energy_step_code_tool_part_9",
                "label" =>
                  "Please use this tool to do your fill in your step code details and it will populate onto the application.",
                "input_type" => "energy_step_code",
                "input_options" => {
                  "conditional" => {
                    "eq" => "tool",
                    "show" => true,
                    "when" => "energy_step_code_method"
                  },
                  "energy_step_code" => "part_9"
                },
                "required" => true
              }
            ]
          ),
          build(
            :requirement_block,
            requirements_attributes: [
              {
                "requirement_code" => "energy_step_code_tool_part_9",
                "label" =>
                  "Please use this tool to do your fill in your step code details and it will populate onto the application.",
                "input_type" => "energy_step_code",
                "input_options" => {
                  "conditional" => {
                    "eq" => "tool",
                    "show" => true,
                    "when" => "energy_step_code_method"
                  },
                  "energy_step_code" => "part_9"
                },
                "required" => true
              },
              {
                "requirement_code" => "energy_step_code_tool_part_9",
                "label" =>
                  "Please use this tool to do your fill in your step code details and it will populate onto the application.",
                "input_type" => "energy_step_code",
                "input_options" => {
                  "conditional" => {
                    "eq" => "tool",
                    "show" => true,
                    "when" => "energy_step_code_method"
                  },
                  "energy_step_code" => "part_9"
                },
                "required" => true
              }
            ]
          ),
          build(
            :requirement_block,
            requirements_attributes: [
              {
                "requirement_code" => "energy_step_code_tool_part_9",
                "label" =>
                  "Please use this tool to do your fill in your step code details and it will populate onto the application.",
                "input_type" => "energy_step_code",
                "input_options" => {
                  "conditional" => {
                    "eq" => "tool",
                    "show" => true,
                    "when" => "energy_step_code_method"
                  },
                  "energy_step_code" => "part_9"
                },
                "required" => true
              },
              {
                "requirement_code" => "energy_step_code_tool_part_9",
                "label" =>
                  "Please use this tool to do your fill in your step code details and it will populate onto the application.",
                "input_type" => "energy_step_code",
                "input_options" => {
                  "conditional" => {
                    "eq" => "tool",
                    "show" => true,
                    "when" => "energy_step_code_method"
                  },
                  "energy_step_code" => "part_9"
                },
                "required" => true
              },
              {
                "requirement_code" => "energy_step_code_report_file",
                "label" => "BC Energy Step Code Compliance Report",
                "input_type" => "file",
                "input_options" => {
                  "conditional" => {
                    "eq" => "file",
                    "show" => true,
                    "when" => "energy_step_code_method"
                  }
                },
                "required" => true
              }
            ]
          ),
          build(
            :requirement_block,
            requirements_attributes: [
              {
                "requirement_code" => "energy_step_code_tool_part_9",
                "label" =>
                  "Please use this tool to do your fill in your step code details and it will populate onto the application.",
                "input_type" => "energy_step_code",
                "input_options" => {
                  "conditional" => {
                    "eq" => "tool",
                    "show" => true,
                    "when" => "energy_step_code_method"
                  },
                  "energy_step_code" => "part_9"
                },
                "required" => true
              },
              {
                "requirement_code" => "energy_step_code_tool_part_9",
                "label" =>
                  "Please use this tool to do your fill in your step code details and it will populate onto the application.",
                "input_type" => "energy_step_code",
                "input_options" => {
                  "conditional" => {
                    "eq" => "tool",
                    "show" => true,
                    "when" => "energy_step_code_method"
                  },
                  "energy_step_code" => "part_9"
                },
                "required" => true
              },
              {
                "requirement_code" => "energy_step_code_h2000_file",
                "label" =>
                  "Pre construction Hot2000 model details, Hot2000 report",
                "input_type" => "file",
                "input_options" => {
                  "conditional" => {
                    "eq" => "file",
                    "show" => true,
                    "when" => "energy_step_code_method"
                  }
                },
                "required" => true
              }
            ]
          ),
          # has duplicate
          build(
            :requirement_block,
            requirements_attributes: [
              {
                "requirement_code" => "energy_step_code_method",
                "label" =>
                  "Which method do you want to do use for the energy step code:",
                "input_type" => "select",
                "input_options" => {
                  "value_options" => [
                    {
                      "label" => "Utilizing the digital step code tool",
                      "value" => "tool"
                    },
                    { "label" => "By file upload", "value" => "file" }
                  ]
                },
                "hint" =>
                  "(if not using the tool, we will allow you to upload by file)",
                "required" => true
              },
              {
                "requirement_code" => "energy_step_code_tool_part_9",
                "label" =>
                  "Please use this tool to do your fill in your step code details and it will populate onto the application.",
                "input_type" => "energy_step_code",
                "input_options" => {
                  "conditional" => {
                    "eq" => "tool",
                    "show" => true,
                    "when" => "energy_step_code_method"
                  },
                  "energy_step_code" => "part_9"
                },
                "required" => true
              },
              {
                "requirement_code" => "energy_step_code_report_file",
                "label" => "BC Energy Step Code Compliance Report",
                "input_type" => "file",
                "input_options" => {
                  "conditional" => {
                    "eq" => "file",
                    "show" => true,
                    "when" => "energy_step_code_method"
                  }
                },
                "required" => true
              },
              {
                "requirement_code" => "energy_step_code_h2000_file",
                "label" =>
                  "Pre construction Hot2000 model details, Hot2000 report",
                "input_type" => "file",
                "input_options" => {
                  "conditional" => {
                    "eq" => "file",
                    "show" => true,
                    "when" => "energy_step_code_method"
                  }
                },
                "required" => true
              },
              {
                "requirement_code" => "energy_step_code_h2000_file",
                "label" =>
                  "Pre construction Hot2000 model details, Hot2000 report",
                "input_type" => "file",
                "input_options" => {
                  "conditional" => {
                    "eq" => "file",
                    "show" => true,
                    "when" => "energy_step_code_method"
                  }
                },
                "required" => true
              }
            ]
          )
        ]

        expect(valid_block).to be_valid

        invalid_blocks.each do |invalid_block|
          expect(invalid_block).not_to be_valid

          expect(invalid_block.errors[:requirements]).to include(
            I18n.t(
              "activerecord.errors.models.requirement_block.attributes.requirements.incorrect_energy_step_code_dependencies"
            )
          )
        end
      end
    end
  end
end
