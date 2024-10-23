class StepCode::BuildingCharacteristics::Line::SpaceHeatingCooling < StepCode::BuildingCharacteristics::Line::Base
  attr_accessor :details, :performance_value

  VARIANTS = { principal: 0, secondary: 1 }.with_indifferent_access

  def variant=(value)
    @variant = VARIANTS[value] || value
  end

  def variant
    VARIANTS.key(@variant)
  end

  PERFORMANCE_TYPES = {
    afue: 0,
    hspf: 1,
    sse: 2,
    cop: 3,
    seer: 4
  }.with_indifferent_access
  include StepCode::BuildingCharacteristics::WithPerformanceType

  def fields
    %i[details variant performance_type performance_value]
  end
end
