FactoryBot.define do
  factory :sub_district, aliases: [:jurisdiction] do
    sequence(:name) { |n| "#{Faker::Address.city} #{n}" }
    type { "SubDistrict" }
    locality_type { "city" }
    description_html { "<p>Some description</p>" }
    checklist_html { "<p>Some checklist</p>" }
    look_out_html { "<p>Some lookout</p>" }
    contact_summary_html { "<p>Some lookout</p>" }
    inbox_enabled { false }
    external_api_state { "g_off" }

    transient do
      heating_degree_days { nil }
      location_name { "General" }
    end

    after(:create) do |jurisdiction, evaluator|
      if evaluator.heating_degree_days.present?
        create(
          :jurisdiction_heating_degree_day,
          jurisdiction: jurisdiction,
          location_name: evaluator.location_name,
          heating_degree_days: evaluator.heating_degree_days
        )
      end
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
