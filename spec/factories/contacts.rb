FactoryBot.define do
  factory :contact do
    name { Faker::Name.name }
    title { Faker::Job.title }
    first_nation { Faker::Nation.nationality }
    email { Faker::Internet.email }
    phone_number { "604-456-7890" }
    association :jurisdiction
  end
end
