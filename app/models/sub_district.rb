class SubDistrict < Jurisdiction
  belongs_to :regional_district, optional: true

  private

  # def has_correct_locality_type
  #   if locality_type == RegionalDistrict.locality_type
  #     errors.add(:locality_type, "must not be #{RegionalDistrict.locality_type} on a SubDistrict")
  #   end
  # end
end
