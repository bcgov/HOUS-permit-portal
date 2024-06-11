class JurisdictionTemplateRequiredStepBlueprint < Blueprinter::Base
  identifier :id

  fields :requirement_template_id, :energy_step_required, :zero_carbon_step_required

  field :requirement_template_label do |jtr_step, _options|
    jtr_step.requirement_template_label
  end
end
