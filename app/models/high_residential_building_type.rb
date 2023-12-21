class HighResidentialBuildingType < ResidentialBuildingType
  validate :density_type_must_be_high

  def initialize(attributes = {})
    super(attributes)
    self.density_type = :high
  end

  def building_type_classification_description
    "High density residential building type"
  end

  def density_type_must_be_high
    errors.add(:density_type, "must be high for HighResidentialBuildingType") unless density_type == :high
  end
end
