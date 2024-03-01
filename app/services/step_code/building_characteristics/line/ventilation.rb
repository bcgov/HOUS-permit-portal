class StepCode::BuildingCharacteristics::Line::Ventilation < StepCode::BuildingCharacteristics::Line::Base
  attr_accessor :details, :percent_eff, :liters_per_sec

  def fields
    %i[details percent_eff liters_per_sec]
  end
end
