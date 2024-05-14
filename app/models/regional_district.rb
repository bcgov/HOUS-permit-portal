class RegionalDistrict < Jurisdiction
  has_many :sub_districts

  def self.locality_type
    "regional district"
  end

  def self.search(*args, **kwargs)
    updated_kwargs = kwargs.merge({ where: { type: self.name } })
    Jurisdiction.search(*args, **updated_kwargs)
  end

  def regional_district_name
    nil
  end

  private
end
