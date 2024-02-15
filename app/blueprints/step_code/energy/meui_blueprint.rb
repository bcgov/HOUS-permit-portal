class StepCode::Energy::MEUIBlueprint < Blueprinter::Base
  fields :meui,
         :meui_requirement,
         :meui_percent_improvement,
         :meui_percent_improvement_requirement,
         :conditioned_percent,
         :energy_target,
         :ref_energy_target

  field :meui_passed do |checker, _options|
    checker.requirements_met?
  end
end
