FactoryBot.define do
  factory :part_3_step_code do
    association :checklist, factory: :part_3_checklist
  end
end
