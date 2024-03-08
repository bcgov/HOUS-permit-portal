class StepCode::BuildingCharacteristics::FossilFuels < StepCode::BuildingCharacteristics::Base
  attr_accessor :details

  PRESENCE = { yes: 0, no: 1, unknown: 2 }.with_indifferent_access

  def presence=(value)
    @presence = PRESENCE[value] || value
  end

  def presence
    PRESENCE.key(@presence)
  end

  def fields
    %i[presence details]
  end
end
