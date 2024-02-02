class GeocoderPolicy < ApplicationPolicy
  def site_options?
    true
  end

  def pid?
    site_options?
  end
end
