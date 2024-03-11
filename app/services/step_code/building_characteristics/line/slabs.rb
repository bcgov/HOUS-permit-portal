class StepCode::BuildingCharacteristics::Line::Slabs < StepCode::BuildingCharacteristics::Line::Base
  attr_accessor :details, :rsi

  def fields
    %i[details rsi]
  end
end
