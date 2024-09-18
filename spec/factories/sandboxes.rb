FactoryBot.define do
  factory :sandbox do
    association :jurisdiction, factory: :sub_district
  end
end
