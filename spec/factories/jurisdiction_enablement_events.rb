FactoryBot.define do
  factory :jurisdiction_enablement_event do
    association :jurisdiction, factory: :sub_district
    feature { :inbox }
    enabled { true }
    occurred_at { 1.month.ago }
    source { :observed }
  end
end
