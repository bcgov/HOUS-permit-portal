class ResidentialBuildingType < BuildingType
  validate :zoning_type_must_be_residential

  def initialize(attributes = {})
    super(attributes)
    self.zoning_type = :residential
  end

  private

  def zoning_type_must_be_residential
    errors.add(:zoning_type, "must be residential for ResidentialBuildingType") unless zoning_type == :residential
  end
end
