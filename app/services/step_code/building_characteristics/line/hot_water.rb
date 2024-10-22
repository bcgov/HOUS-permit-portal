class StepCode::BuildingCharacteristics::Line::HotWater < StepCode::BuildingCharacteristics::Line::Base
  attr_accessor :details, :performance_value

  PERFORMANCE_TYPES = {
    percent_eff: 0,
    afue: 1,
    uef: 2,
    ef: 3,
    eer: 4
  }.with_indifferent_access
  include StepCode::BuildingCharacteristics::WithPerformanceType

  def fields
    %i[details performance_type performance_value]
  end
end
