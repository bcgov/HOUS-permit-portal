class ResidentialBuildingType < BuildingType
  validate :zoning_type_must_be_commercial

  def initialize(attributes = {})
    super(attributes)
    self.zoning_type = :commercial
  end

  private

  def zoning_type_must_be_commercial
    errors.add(:zoning_type, "must be commercial for ResidentialBuildingType") unless zoning_type == :commercial
  end
end
