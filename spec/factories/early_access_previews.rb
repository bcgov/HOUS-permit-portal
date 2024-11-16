# spec/factories/early_access_previews.rb

FactoryBot.define do
  factory :early_access_preview do
    association :early_access_requirement_template
    association :previewer, factory: %i[user submitter] # Associates with a user who has the submitter trait

    expires_at { 1.week.from_now } # Default expiration set a week from creation

    trait :discarded do
      discarded_at { Time.current } # Sets the `discarded_at` attribute to simulate revocation
    end
  end
end
