class StepCode::BuildingCharacteristics::Line::WindowsGlazedDoors < StepCode::BuildingCharacteristics::Line::Base
  attr_accessor :details, :shgc, :performance_value

  def fields
    %i[details performance_value shgc]
  end
end
