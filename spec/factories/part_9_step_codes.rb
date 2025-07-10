FactoryBot.define do
  factory :part_9_step_code do
    # Allow permit_application to be passed in or be nil
    # If not passed, it won't try to create one by default here,
    # allowing for step_codes not tied to a permit_application.
    permit_application { nil }

    association :pre_construction_checklist, factory: :part_9_checklist

    # Transient attribute to allow passing a jurisdiction when a new permit_project might be created
    transient { jurisdiction { nil } }

    after(:build) do |step_code_instance, evaluator|
      # Only set permit_project if it hasn't been set explicitly
      # (e.g., by passing permit_project: my_project to the factory)
      if step_code_instance.permit_project.blank?
        if step_code_instance.permit_application.present? &&
             step_code_instance.permit_application.permit_project.present?
          # If there's an associated permit_application with a permit_project, use that one.
          step_code_instance.permit_project =
            step_code_instance.permit_application.permit_project
        else
          # Otherwise, create a new permit_project.
          # Use the transient jurisdiction if provided, otherwise the :permit_project factory's default.
          project_attrs = {}
          project_attrs[
            :jurisdiction
          ] = evaluator.jurisdiction if evaluator.jurisdiction.present?
          # Use build to avoid saving if the step_code itself is only being built.
          # If the step_code is created, this permit_project will also be saved due to associations.
          step_code_instance.permit_project =
            FactoryBot.build(:permit_project, **project_attrs)
        end
      end
    end
  end
end
