# spec/factories/integration_mapping_notifications.rb

FactoryBot.define do
  factory :integration_mapping_notification do
    association :template_version
    front_end_path { "/path/to/frontend/#{SecureRandom.hex(4)}" }
    processed_at { nil }

    # Default association is with ExternalApiKey
    association :notifiable, factory: :external_api_key

    # Trait for notifications associated with a User using :review_manager
    trait :for_user do
      association :notifiable, factory: %i[user review_manager]
      front_end_path { "/user/path/#{SecureRandom.hex(4)}" }
    end

    # Trait to mark notifications as processed
    trait :processed do
      processed_at { Time.current }
    end
  end
end
