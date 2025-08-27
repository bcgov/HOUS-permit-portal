FactoryBot.define do
  factory :collaborator do
    association :user

    # Default collaboratorable is a User (submission collaborator context)
    association :collaboratorable, factory: :user

    trait :for_jurisdiction do
      association :collaboratorable, factory: :sub_district
    end
  end
end
