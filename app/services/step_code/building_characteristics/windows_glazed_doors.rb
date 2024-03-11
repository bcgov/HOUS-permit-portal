class StepCode::BuildingCharacteristics::WindowsGlazedDoors < StepCode::BuildingCharacteristics::Base
  include ActiveModel::Model

  PERFORMANCE_TYPES = { usi: 0, u_imp: 1 }.with_indifferent_access
  include StepCode::BuildingCharacteristics::WithPerformanceType

  def lines=(value)
    @lines = value
  end

  def lines
    StepCode::BuildingCharacteristics::Line::WindowsGlazedDoors.load(@lines)
  end

  def fields
    %i[performance_type lines]
  end
end
