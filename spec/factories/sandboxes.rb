FactoryBot.define do
  factory :sandbox do
    association :jurisdiction, factory: :sub_district
    template_version_status_scope { :published }

    trait :published do
      template_version_status_scope { :published }
    end

    trait :scheduled do
      template_version_status_scope { :scheduled }
    end
  end
end
