FactoryBot.define do
  factory :requirement_block_requirement do
    association :requirement_block
    association :requirement
  end
end
