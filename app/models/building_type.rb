class BuildingType < ApplicationRecord
  has_many :permit_applications
  before_validation :set_type

  private

  def set_type
    self.type = "#{density_type.capitalize}#{zoning_type.capitalize}BuildingType"
  end
end
