class StepCode::Energy::AirtightnessBlueprint < Blueprinter::Base
  fields :ach,
         :ach_requirement,
         :nla,
         :nla_requirement,
         :nlr,
         :nlr_requirement,
         :surface_area,
         :volume,
         :total_heated_floor_area

  field :airtightness_passed do |checker, _options|
    checker.requirements_met?
  end
end
