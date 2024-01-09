class RegionalDistrict < Jurisdiction
  has_many :sub_districts

  def self.locality_type
    "regional district"
  end

  private

  def has_correct_locality_type
    if locality_type != RegionalDistrict.locality_type
      errors.add(:locality_type, "must be #{RegionalDistrict.locality_type} on a RegionalDistrict")
    end
  end
end
