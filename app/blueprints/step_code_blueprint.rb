class StepCodeBlueprint < Blueprinter::Base
  identifier :id

  fields :type,
         :created_at,
         :updated_at,
         :discarded_at,
         :title,
         :reference_number,
         :full_address,
         :pid,
         :jurisdiction_name,
         :permit_date,
         :phase,
         :current_stage,
         :permit_application_id,
         :permit_project_title,
         :stage_completions

  association :creator, blueprint: UserBlueprint

  association :jurisdiction, blueprint: JurisdictionBlueprint, view: :base

  # Index rows span projects. Standalone codes belong to the creator.
  # Attached codes follow delete_step_code? (Full and Expanded).
  field :can_archive,
        if: ->(_field_name, _step_code, options) do
          options[:pundit_user]
        end do |step_code, options|
    StepCodePolicy.new(options[:pundit_user], step_code).destroy?
  end
end
