# frozen_string_literal: true

class Api::IntegrationMappingsController < Api::ApplicationController
  before_action :set_integration_mapping, only: %i[update]

  def update
    authorize @integration_mapping

    if @integration_mapping.update_requirements_mapping(
         integration_mapping_params.to_h[:simplified_map]
       )
      render_success @integration_mapping,
                     "integration_mapping.update_success",
                     {
                       blueprint: IntegrationMappingBlueprint,
                       blueprint_opts: {
                         view: :base
                       }
                     }
    else
      render_error "integration_mapping.update_error"
    end
  end

  private

  def set_integration_mapping
    @integration_mapping = IntegrationMapping.find(params[:id])
  end

  def integration_mapping_params
    params.require(:integration_mapping).permit(simplified_map: {})
  end
end
