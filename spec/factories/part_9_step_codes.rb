FactoryBot.define do
  factory :part_9_step_code, parent: :step_code, class: "Part9StepCode" do
    # Allow permit_application to be passed in or be nil
    # If not passed, it won't try to create one by default here,
    # allowing for step_codes not tied to a permit_application.
    permit_application { nil }

    association :pre_construction_checklist, factory: :part_9_checklist

    # Transient attribute to allow passing a jurisdiction when a new permit_project might be created
    transient { jurisdiction { nil } }
  end
end
