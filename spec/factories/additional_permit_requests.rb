FactoryBot.define do
  factory :additional_permit_request do
    comment { "This work also needs a plumbing permit." }
    association :submission_version
    association :user, factory: %i[user reviewer]
    association :requirement_template
    name_snapshot { "Plumbing permit" }
  end
end
