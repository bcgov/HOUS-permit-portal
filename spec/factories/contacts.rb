FactoryBot.define do
  factory :contact do
    name { Faker::Name.name }
    title { Faker::Job.title }
    first_nation { Faker::Nation.nationality }
    email { Faker::Internet.email }
    phone_number { Faker::PhoneNumber.phone_number }
    association :local_jurisdiction
  end
end
