class LowResidentialBuildingType < ResidentialBuildingType
  validate :density_type_must_be_low

  def initialize(attributes = {})
    super(attributes)
    self.density_type = :low
  end

  def self.default_building_type_data
    [
      { name: "Detached", description: "With or without secondary suite" },
      { name: "Semi-Detached", description: "House, duplex, townhome, or rowhome" },
      { name: "Secondary Suite", description: "Secondary suite" },
      { name: "Small Apartment", description: "Triplex, fourplex, 2-4 unit" },
      {
        name: "Residential Accessory Dwelling Unit",
        description: "Garden Suite, laneway house, carriage house, coach home, manufactured home/pre-fab",
      },
      {
        name: "Non-Residential Accessory Dwelling Unit",
        description: "garage, sheds over 10m^2 on the same property, swimming pool, etc.",
      },
    ]
  end

  def building_type_classification_description
    "Low density residential building type"
  end

  private

  def density_type_must_be_low
    errors.add(:density_type, "must be low for LowResidentialBuildingType") unless density_type == :low
  end
end
