FactoryBot.define do
  factory :part_3_step_code, parent: :step_code, class: "Part3StepCode" do
    association :checklist, factory: :part_3_checklist
  end
end
