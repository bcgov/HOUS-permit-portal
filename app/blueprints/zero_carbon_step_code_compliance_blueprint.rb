class ZeroCarbonStepCodeComplianceBlueprint < Blueprinter::Base
  fields :total_ghg,
         :co2,
         :co2_requirement,
         :co2_max_requirement,
         :heating,
         :hot_water,
         :other,
         :heating_requirement,
         :hot_water_requirement,
         :other_requirement
end
