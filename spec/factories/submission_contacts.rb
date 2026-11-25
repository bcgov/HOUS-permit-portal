FactoryBot.define do
  factory :submission_contact, class: "ApplicationSubmissionContact" do
    association :jurisdiction
    email { Faker::Internet.email }
    title { "Building Inspector" }
    confirmation_token { Devise.friendly_token }
    confirmation_sent_at { Time.now.utc - 1.day }
    confirmed_at { Time.now.utc }

    factory :application_submission_contact,
            class: "ApplicationSubmissionContact"

    factory :meeting_submission_contact, class: "MeetingSubmissionContact"

    factory :property_information_submission_contact,
            class: "PropertyInformationSubmissionContact"
  end
end
