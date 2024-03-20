class StepCode::BuildingCharacteristics::Line::Doors < StepCode::BuildingCharacteristics::Line::Base
  attr_accessor :details, :performance_value

  PERFORMANCE_TYPES = { usi: 0, rsi: 1 }.with_indifferent_access
  include StepCode::BuildingCharacteristics::WithPerformanceType

  def fields
    %i[details performance_type performance_value]
  end
end
