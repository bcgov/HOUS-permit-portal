FactoryBot.define do
  factory :step_code, class: "Part9StepCode" do
    association :pre_construction_checklist, factory: :part_9_checklist
    association :creator, factory: :user, role: :submitter
  end
end
