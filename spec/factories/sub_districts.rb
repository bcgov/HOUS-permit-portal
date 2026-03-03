FactoryBot.define do
  factory :sub_district do
    sequence(:name) { |n| "#{Faker::Address.city} #{n}" }
    type { "SubDistrict" }
    locality_type { "city" }
    description_html { "<p>Some description</p>" }
    checklist_html { "<p>Some checklist</p>" }
    look_out_html { "<p>Some lookout</p>" }
    contact_summary_html { "<p>Some lookout</p>" }
    inbox_enabled { false }
    external_api_state { "g_off" }

    after(:create) do |jurisdiction|
      create(
        :submission_contact,
        jurisdiction: jurisdiction,
        confirmed_at: Time.current,
        default: true
      )
      jurisdiction.update_column(:inbox_enabled, true)
    end
  end
end
