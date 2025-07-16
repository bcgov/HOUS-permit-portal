class StepCodeBaseBlueprint < Blueprinter::Base
  identifier :id

  fields :type,
         :project_name,
         :project_identifier,
         :full_address,
         :jurisdiction_name,
         :permit_date

  field :parent_type do |step_code, _options|
    step_code.parent&.class&.name
  end

  field :parent_id do |step_code, _options|
    step_code.parent&.id
  end
end
