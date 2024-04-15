FactoryBot.define do
  factory :contact do
    first_name { Faker::Name.name }
    last_name { Faker::Name.name }
    title { Faker::Job.title }
    department { Faker::Commerce.department }
    email { "#{name.underscore.parameterize}@example.com" }
    phone { "604-456-7890" }
    association :contactable
  end
end
