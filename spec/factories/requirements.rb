FactoryBot.define do
  factory :requirement do
    label { Faker::Lorem.unique.words(number: 4).join(" ") }
    input_type { 0 }
    input_options { {} }
    hint { nil }
    required { false }
    elective { false }
    related_content { nil }
    required_for_in_person_hint { false }
    required_for_multiple_owners { false }

    association :requirement_block

    factory :energy_step_code_tool_part_9_requirement do
      requirement_code { "energy_step_code_tool_part_9" }
      input_type { "energy_step_code" }
      input_options do
        {
          "conditional" => {
            "eq" => "tool",
            "show" => true,
            "when" => "energy_step_code_method"
          },
          "energy_step_code" => "part_9"
        }
      end
    end

    factory :energy_step_code_method_requirement do
      requirement_code { "energy_step_code_method" }
      input_type { "select" }
      input_options do
        {
          "value_options" => [
            {
              "label" => "Utilizing the digital step code tool",
              "value" => "tool"
            },
            { "label" => "By file upload", "value" => "file" }
          ]
        }
      end
    end

    factory :energy_step_code_report_file_requirement do
      requirement_code { "energy_step_code_report_file" }
      input_type { "file" }
      input_options do
        {
          "conditional" => {
            "eq" => "file",
            "show" => true,
            "when" => "energy_step_code_method"
          }
        }
      end
    end

    factory :energy_step_code_h2000_file_requirement do
      requirement_code { "energy_step_code_h2000_file" }
      input_type { "file" }
      input_options do
        {
          "conditional" => {
            "eq" => "file",
            "show" => true,
            "when" => "energy_step_code_method"
          }
        }
      end
    end
  end
end
