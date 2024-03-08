class StepCodeBuildingCharacteristicsSummaryBlueprint < Blueprinter::Base
  identifier :id

  transform StepCode::BuildingCharacteristicsTransformer
end
