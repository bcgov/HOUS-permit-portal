class StepCode::BuildingCharacteristicsSummaryBlueprint < Blueprinter::Base
  identifier :id

  transform StepCode::BuildingCharacteristicsTransformer
end
