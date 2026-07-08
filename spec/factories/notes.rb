FactoryBot.define do
  factory :note do
    association :noteable, factory: %i[project_meeting open]
    association :user, :reviewer
    body { "<p>Meeting scheduled with requester.</p>" }
  end
end
