class PermitTypeRequiredStepBlueprint < Blueprinter::Base
  identifier :id

  fields :permit_type_id,
         :energy_step_required,
         :zero_carbon_step_required,
         :default

  field :permit_type_name do |ptr_step, _options|
    ptr_step.permit_type_name
  end

  field :activity_label do |ptr_step, _options|
    template = RequirementTemplate.find_by(permit_type: ptr_step.permit_type)
    template&.activity&.name
  end
end
