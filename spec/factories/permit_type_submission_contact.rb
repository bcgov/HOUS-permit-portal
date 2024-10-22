# In spec/factories/permit_type_submission_contacts.rb or test/factories/permit_type_submission_contacts.rb

FactoryBot.define do
  factory :permit_type_submission_contact do
    association :jurisdiction
    permit_type do
      PermitType.first || association(:permit_type, code: :low_residential)
    end
    email { Faker::Internet.email }
    confirmation_token { Devise.friendly_token }
    confirmation_sent_at { Time.now.utc }
    # Optionally set other fields, e.g., confirmed_at

    # If your model has validations or other logic that requires specific
    # setup for these associated objects, make sure to create them properly.
    # For instance, if `Jurisdiction` or `PermitType` needs specific attributes
    # to be valid or to make sense in your domain, ensure they are set either
    # in their respective factories or here when you use them.
  end
end
