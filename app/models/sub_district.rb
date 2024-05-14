class SubDistrict < Jurisdiction
  belongs_to :regional_district, optional: true

  def self.search(*args, **kwargs)
    updated_kwargs = kwargs.merge({ where: { type: self.name } })
    Jurisdiction.search(*args, **updated_kwargs)
  end

  def regional_district_name
    regional_district&.reverse_qualified_name
  end

  private
end
