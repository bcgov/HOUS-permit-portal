class ExternalApi::V1::PermitApplicationsController < ExternalApi::ApplicationController
  include ExternalApi::Concerns::Search::PermitApplications

  before_action :set_permit_application, only: :show
  before_action :set_template_version, only: :show_integration_mapping

  def index
    perform_permit_application_search
    authorized_results =
      apply_search_authorization(@permit_application_search.results)
    render_success authorized_results,
                   nil,
                   {
                     meta: {
                       total_pages: @permit_application_search.total_pages,
                       total_count: @permit_application_search.total_count,
                       current_page: @permit_application_search.current_page
                     },
                     blueprint: PermitApplicationBlueprint,
                     blueprint_opts: {
                       view: :external_api
                     }
                   }
  end

  def show
    authorize [:external_api, @permit_application]

    render_success @permit_application,
                   nil,
                   {
                     blueprint: PermitApplicationBlueprint,
                     blueprint_opts: {
                       view: :external_api
                     }
                   }
  end

  def show_integration_mapping
    @integration_mapping =
      @template_version.integration_mappings.find_by(
        jurisdiction: current_external_api_key.jurisdiction
      )

    authorize @integration_mapping,
              policy_class: ExternalApi::PermitApplicationPolicy

    if @integration_mapping.present?
      render_success @integration_mapping,
                     nil,
                     {
                       blueprint: IntegrationMappingBlueprint,
                       blueprint_opts: {
                         view: :external_api
                       }
                     }
    else
      render_error "integration_mapping.not_found_error", status: 404
    end
  end

  private

  def set_permit_application
    @permit_application =
      PermitApplication.for_sandbox(current_sandbox).find(params[:id])
  end

  def set_template_version
    @template_version =
      TemplateVersion.for_sandbox(current_sandbox).find(
        params[:template_version_id]
      )
  end
end
