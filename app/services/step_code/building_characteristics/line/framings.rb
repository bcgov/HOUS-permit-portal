class StepCode::BuildingCharacteristics::Line::Framings < StepCode::BuildingCharacteristics::Line::Base
  attr_accessor :details, :rsi

  def fields
    %i[details rsi]
  end
end
