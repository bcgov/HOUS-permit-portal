FactoryBot.define do
  factory :project_membership do
    association :permit_project
    association :user
    access { :standard }
    contact_designation { :none }

    trait :pending_invitation do
      user { nil }
      invited_first_name { "Wanda" }
      invited_last_name { "Walls" }
      sequence(:invited_email) { |n| "wanda-#{n}@example.com" }
      association :invited_by, factory: %i[user submitter]
      invitation_sent_at { Time.current }
      transient { raw_invitation_token { SecureRandom.urlsafe_base64(32) } }

      after(:build) do |membership, evaluator|
        membership.invitation_token =
          Devise.token_generator.digest(
            ProjectMembership,
            :invitation_token,
            evaluator.raw_invitation_token
          )
      end
    end
  end
end
