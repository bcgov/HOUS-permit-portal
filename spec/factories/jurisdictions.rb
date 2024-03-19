FactoryBot.define do
  factory :jurisdiction do
    name { Faker::Address.city }
    type { "SubDistrict" }
    locality_type { "city" }
    description_html { "<p>Some description</p>" }
    checklist_html { "<p>Some checklist</p>" }
    look_out_html { "<p>Some lookout</p>" }
    contact_summary_html { "<p>Some lookout</p>" }

    after(:create) do |jurisdiction|
      create(:permit_type_submission_contact, jurisdiction: jurisdiction)
      # This creates a PermitTypeSubmissionContact associated with the jurisdiction.
      # If your PermitTypeSubmissionContact factory requires a permit_type,
      # ensure that a permit_type factory is also defined and associated here.
    end
  end
end
