FactoryBot.define do
  factory :part_9_step_code do
    association :pre_construction_checklist, factory: :part_9_checklist
  end
end
