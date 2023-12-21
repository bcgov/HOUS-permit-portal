class MediumResidentialBuildingType < ResidentialBuildingType
  validate :density_type_must_be_medium

  def initialize(attributes = {})
    super(attributes)
    self.density_type = :medium
  end

  def building_type_classification_description
    "Medium density residential building type"
  end

  private

  def density_type_must_be_medium
    errors.add(:density_type, "must be medium for MediumResidentialBuildingType") unless density_type == :medium
  end
end
