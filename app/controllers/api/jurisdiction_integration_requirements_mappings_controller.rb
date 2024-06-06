# frozen_string_literal: true

class Api::JurisdictionIntegrationRequirementsMappingsController < Api::ApplicationController
  before_action :set_jurisdiction_integration_requirements_mapping, only: %i[update]

  def update
    authorize @jurisdiction_integration_requirements_mapping

    if @jurisdiction_integration_requirements_mapping.update_requirements_mapping(
         jurisdiction_integration_requirements_mapping_params.to_h[:simplified_map],
       )
      render_success @jurisdiction_integration_requirements_mapping,
                     "jurisdiction_integration_requirements_mapping.update_success"
    else
      render_error "jurisdiction_integration_requirements_mapping.update_error"
    end
  end

  private

  def set_jurisdiction_integration_requirements_mapping
    @jurisdiction_integration_requirements_mapping = JurisdictionIntegrationRequirementsMapping.find(params[:id])
  end

  def jurisdiction_integration_requirements_mapping_params
    params.require(:jurisdiction_integration_requirements_mapping).permit(simplified_map: {})
  end
end
