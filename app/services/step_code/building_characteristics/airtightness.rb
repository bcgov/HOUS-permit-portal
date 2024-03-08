class StepCode::BuildingCharacteristics::Airtightness < StepCode::BuildingCharacteristics::Base
  attr_accessor :details

  def fields
    %i[details]
  end
end
