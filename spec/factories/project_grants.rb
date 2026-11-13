FactoryBot.define do
  factory :project_grant do
    kind { :block }
    requirement_block_id { SecureRandom.uuid }
    project_membership
    permit_application do
      association :permit_application,
                  permit_project: project_membership.permit_project,
                  submitter: project_membership.permit_project.owner
    end

    trait :application do
      kind { :application }
      requirement_block_id { nil }
    end

    trait :invite do
      kind { :invite }
      permit_application { nil }
      requirement_block_id { nil }
      project_membership { association :project_membership, access: :expanded }
    end
  end
end
