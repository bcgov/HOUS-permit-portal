class StepCode::BuildingCharacteristics::Line::Other < StepCode::BuildingCharacteristics::Line::Base
  attr_accessor :details

  def fields
    %i[details]
  end
end
