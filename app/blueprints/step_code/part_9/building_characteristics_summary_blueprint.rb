class StepCode::Part9::BuildingCharacteristicsSummaryBlueprint < Blueprinter::Base
  identifier :id

  transform StepCode::Part9::BuildingCharacteristicsTransformer
end
