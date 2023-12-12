FactoryBot.define do
  factory :local_jurisdiction do
    name { Faker::Address.city }
    description { Faker::Lorem.paragraph }
    checklist_slate_data { { children: [{ text: Faker::Lorem.sentence }] } }
    look_out_slate_data { { children: [{ text: Faker::Lorem.sentence }] } }
  end
end
