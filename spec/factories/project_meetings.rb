FactoryBot.define do
  factory :project_meeting do
    association :permit_project
    requested_by { permit_project.owner || create(:user, :submitter) }
    status { :draft }
    requester_relationship { :owner_or_landholder }
    contact_name { requested_by.name }
    contact_email { requested_by.email }
    contact_phone_number { "2505551212" }
    project_description { "Build a detached garage." }
    meeting_notes { "Please review zoning constraints." }
    request_property_information { false }

    trait :open do
      status { :open }
      submitted_at { Time.current }
    end

    trait :scheduled do
      status { :scheduled }
      submitted_at { Time.current }
      contact_method { :phone }
      confirmed_date { 1.week.from_now }
      scheduled_at { Time.current }
    end

    trait :completed do
      status { :completed }
      submitted_at { Time.current }
      contact_method { :phone }
      confirmed_date { 1.week.from_now }
      scheduled_at { Time.current }
      completed_at { Time.current }
    end

    trait :closed do
      status { :closed }
      submitted_at { Time.current }
      closed_at { Time.current }
    end

    trait :viewed do
      viewed_at { Time.current }
    end
  end
end
