FactoryBot.define do
  factory :sub_district do
    sequence(:name) { |n| "#{Faker::Address.city} #{n}" }
    type { "SubDistrict" }
    locality_type { "city" }
    description_html { "<p>Some description</p>" }
    checklist_html { "<p>Some checklist</p>" }
    look_out_html { "<p>Some lookout</p>" }
    contact_summary_html { "<p>Some lookout</p>" }
    external_api_state { "g_off" } # Updated from external_api_enabled

    after(:create) do |jurisdiction|
      create(:permit_type_submission_contact, jurisdiction: jurisdiction)
    end
  end
end
