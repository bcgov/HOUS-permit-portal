class PermitTypeRequiredStepBlueprint < Blueprinter::Base
  identifier :id

  fields :permit_type_id,
         :energy_step_required,
         :zero_carbon_step_required,
         :default

  field :permit_type_name do |ptr_step, _options|
    ptr_step.permit_type_name
  end
end
