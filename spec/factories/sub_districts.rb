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
      climate_zone { nil }
    end

    after(:create) do |jurisdiction, evaluator|
      if evaluator.heating_degree_days.present?
        climate_zone =
          evaluator.climate_zone ||
            StepCode::Part3::V0::Requirements::References::ClimateZone.value(
              evaluator.heating_degree_days
            )&.downcase || "zone_5"

        create(
          :jurisdiction_climate_zone,
          jurisdiction: jurisdiction,
          climate_zone: climate_zone,
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
