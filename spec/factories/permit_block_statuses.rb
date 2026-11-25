FactoryBot.define do
  factory :permit_block_status do
    association :permit_application
    requirement_block_id { SecureRandom.uuid }
    status { :draft }
  end
end
