FactoryBot.define do
  factory :step_code do
    association :creator, factory: :user, role: :submitter
  end
end
