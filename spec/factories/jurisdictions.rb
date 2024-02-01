FactoryBot.define do
  factory :jurisdiction do
    name { Faker::Address.city }
    type { "SubDistrict" }
    locality_type { "city" }
    description { Faker::Lorem.paragraph }
    checklist_html do
      {
        ops: [
          { insert: "Checklist Item 1" },
          { insert: "\n", attributes: { list: "bullet" } },
          { insert: "Checklist Item 2" },
          { insert: "\n", attributes: { list: "bullet" } },
        ],
      }.to_json
    end
    look_out_html do
      {
        ops: [
          { insert: "Look Out Point 1" },
          { insert: "\n", attributes: { list: "ordered" } },
          { insert: "Look Out Point 2" },
          { insert: "\n", attributes: { list: "ordered" } },
        ],
      }.to_json
    end
  end
end
