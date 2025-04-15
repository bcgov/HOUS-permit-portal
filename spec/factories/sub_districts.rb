FactoryBot.define do
  factory :sub_district do
    sequence(:name) { |n| "#{Faker::Address.city} #{n}" }
    type { "SubDistrict" }
    locality_type { "city" }
    description_html { "<p>Some description</p>" }
    checklist_html { "<p>Some checklist</p>" }
    look_out_html { "<p>Some lookout</p>" }
    contact_summary_html { "<p>Some lookout</p>" }
    inbox_enabled { true }
    external_api_state { "g_off" } # Updated from external_api_enabled

    after(:build) do |jurisdiction|
      # Only create contacts if inbox is enabled, as per the validation logic
      if jurisdiction.inbox_enabled?
        # Ensure contacts are created for ALL enabled permit types
        PermitType.enabled.each do |permit_type|
          # Build (don't create) the contact associated with the jurisdiction instance.
          # It will be saved automatically when the jurisdiction is saved.
          # Ensure email and confirmed_at are set to pass the validation check.
          unless jurisdiction.permit_type_submission_contacts.any? { |c|
                   c.permit_type_id == permit_type.id
                 }
            jurisdiction.permit_type_submission_contacts.build(
              permit_type: permit_type,
              email: Faker::Internet.email,
              confirmed_at: Time.current # Mark as confirmed
              # Assuming the :permit_type_submission_contact factory doesn't set these
            )
          end
          # The unless condition prevents adding duplicate contacts if they were somehow added before this callback
        end

        # Optional: Add a check/warning if no enabled PermitTypes exist in the test setup,
        # as this might indicate an issue elsewhere or lead to unexpected validation passes.
        # if PermitType.enabled.empty?
        #   Rails.logger.warn "Warning: Building SubDistrict with inbox_enabled=true but no enabled PermitTypes found."
        # end
      end
    end
  end
end
