# frozen_string_literal: true

class AddIntegrationMappingsForJurisdictions < ActiveRecord::Migration[7.1]
  def up
    jurisdictions_wit_api_enabled =
      Jurisdiction.where(external_api_state: "j_on")

    jurisdictions_wit_api_enabled.each do |jurisdiction|
      jurisdiction.create_integration_mappings
    end
  end

  def down
    IntegrationMapping.destroy_all
  end
end
