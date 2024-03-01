class StepCode::BuildingCharacteristics::Line::UnheatedFloors < StepCode::BuildingCharacteristics::Line::Base
  attr_accessor :details, :rsi

  def fields
    %i[details rsi]
  end
end
