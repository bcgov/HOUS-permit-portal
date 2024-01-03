FactoryBot.define do
  factory :jurisdiction do
    name { Faker::Address.city }
    description { Faker::Lorem.paragraph }
    checklist_slate_data do
      [{ children: [{ text: Faker::Lorem.sentence }] }, { children: [{ text: Faker::Lorem.sentence }] }]
    end
    look_out_slate_data do
      [{ children: [{ text: Faker::Lorem.sentence }] }, { children: [{ text: Faker::Lorem.sentence }] }]
    end
  end
end
