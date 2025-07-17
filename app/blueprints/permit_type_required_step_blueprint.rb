class PermitTypeRequiredStepBlueprint < Blueprinter::Base
  identifier :id

  fields :permit_type_id,
         :energy_step_required,
         :zero_carbon_step_required,
         :permit_type_name,
         :default

  field :activity_name do |ptr_step, _options|
    template = RequirementTemplate.find_by(permit_type: ptr_step.permit_type)
    template&.activity&.name
  end
end
