class SubDistrict < Jurisdiction
  belongs_to :regional_district, optional: true

  private
end
