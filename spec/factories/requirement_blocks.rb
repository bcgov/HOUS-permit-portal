FactoryBot.define do
  factory :requirement_block do
    name { Faker::Lorem.unique.words(number: 4).join(" ") }
    display_name { Faker::Lorem.unique.words(number: 2).join(" ") }
    sign_off_role { 0 }
    reviewer_role { 0 }
    custom_validations { "{}" }

    factory :requirement_block_with_requirements do
      transient { requirements_count { 5 } }

      after(:create) do |requirement_block, evaluator|
        requirement_block.requirements << create_list(
          :requirement,
          evaluator.requirements_count,
          requirement_block: requirement_block
        )

        # You may need to reload the record here, depending on your application
        requirement_block.reload
      end
    end

    factory :valid_energy_step_code_requirement_block do
      after(:create) do |requirement_block, _evaluator|
        requirement_block.requirements_attributes = [
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
            "label" => "Pre construction Hot2000 model details, Hot2000 report",
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

        requirement_block.save

        # You may need to reload the record here, depending on your application
        requirement_block.reload
      end
    end
  end
end
