FactoryBot.define do
  factory :jurisdiction_service_partner_enrollment do
    association :jurisdiction
    service_partner { :archistar }
    enabled { true }
  end
end
