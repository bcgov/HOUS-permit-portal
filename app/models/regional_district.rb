class RegionalDistrict < Jurisdiction
  has_many :sub_districts

  def self.locality_type
    "regional district"
  end

  private
end
