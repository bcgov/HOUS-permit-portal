FactoryBot.define do
  factory :permit_collaboration do
    collaborator
    permit_application do
      association :permit_application,
                  :newly_submitted,
                  jurisdiction: collaborator.jurisdiction
    end

    collaborator_type { :delegatee }

    trait :delegatee do
      collaborator_type { :delegatee }
    end

    trait :assignee do
      collaborator_type { :assignee }
      assigned_requirement_block_id { SecureRandom.uuid }
    end
  end
end
