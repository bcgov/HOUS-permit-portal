class StepCode::Energy::TEDIBlueprint < Blueprinter::Base
  fields :tedi,
         :tedi_requirement,
         :tedi_hlr_percent,
         :tedi_hlr_percent_requirement

  field :tedi_passed do |checker, _options|
    checker.requirements_met?
  end
end
