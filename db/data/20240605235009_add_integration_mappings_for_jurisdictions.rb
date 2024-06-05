# frozen_string_literal: true

class AddIntegrationMappingsForJurisdictions < ActiveRecord::Migration[7.1]
  def up
    jurisdictions_wit_api_enabled = Jurisdiction.where(external_api_enabled: true)

    jurisdictions_wit_api_enabled.each { |jurisdiction| jurisdiction.create_integration_requirements_mappings }
  end

  def down
    JurisdictionIntegrationRequirementsMapping.destroy_all
  end
end
