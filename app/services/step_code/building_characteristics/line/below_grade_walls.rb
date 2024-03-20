class StepCode::BuildingCharacteristics::Line::BelowGradeWalls < StepCode::BuildingCharacteristics::Line::Base
  attr_accessor :details, :rsi

  def fields
    %i[details rsi]
  end
end
