class JurisdictionHeatingDegreeDayBlueprint < Blueprinter::Base
  identifier :id

  fields :location_name, :heating_degree_days

  field :climate_zone do |record, _options|
    record.climate_zone
  end
end
