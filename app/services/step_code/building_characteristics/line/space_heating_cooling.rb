class StepCode::BuildingCharacteristics::Line::SpaceHeatingCooling < StepCode::BuildingCharacteristics::Line::Base
  attr_accessor :details, :performance_value

  PERFORMANCE_TYPES = {
    afue: 0,
    hspf: 1,
    sse: 2,
    cop: 3,
    seer: 4
  }.with_indifferent_access
  include StepCode::BuildingCharacteristics::WithPerformanceType

  # HUB-5472: Dropped legacy principal/secondary `variant` from serialized fields.
  # Older JSONB rows may still contain a variant key; Base#initialize ignores it.
  def fields
    %i[details performance_type performance_value]
  end
end
