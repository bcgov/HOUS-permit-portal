class StepCode::ZeroCarbon::PrescriptiveBlueprint < Blueprinter::Base
  fields :prescriptive_heating,
         :prescriptive_heating_requirement,
         :prescriptive_hot_water,
         :prescriptive_hot_water_requirement,
         :prescriptive_other,
         :prescriptive_other_requirement

  field :prescriptive_passed do |checker, _options|
    checker.requirements_met?
  end
end
