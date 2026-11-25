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
         :permit_project_title

  # datetime_format does not walk into this hash. JSON.generate would emit
  # "2026-06-12 10:00:00 -0700", which Safari parses as an Invalid Date.
  field :stage_completions do |step_code|
    formatter = Blueprinter.configuration.datetime_format
    step_code.stage_completions.map do |completion|
      completed_at = completion[:stage_completed_at]
      next completion unless completed_at

      completion.merge(stage_completed_at: formatter.call(completed_at))
    end
  end

  association :creator, blueprint: UserBlueprint

  association :jurisdiction, blueprint: JurisdictionBlueprint, view: :base
end
