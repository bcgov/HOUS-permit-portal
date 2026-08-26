FactoryBot.define do
  factory :part_3_step_code, class: "Part3StepCode" do
    association :pre_construction_checklist, factory: :part_3_checklist
  end
end
