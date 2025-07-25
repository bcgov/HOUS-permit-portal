FactoryBot.define do
  factory :step_code do
    association :pre_construction_checklist, factory: :step_code_checklist
    association :creator, factory: :user, role: :submitter
  end
end
