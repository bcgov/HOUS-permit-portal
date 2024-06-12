class ExternalApi::V1::PermitApplicationsController < ExternalApi::ApplicationController
  include ExternalApi::Concerns::Search::PermitApplications

  before_action :set_permit_application, only: :show

  def index
    perform_permit_application_search
    authorized_results = apply_search_authorization(@permit_application_search.results)
    render_success authorized_results,
                   nil,
                   {
                     meta: {
                       total_pages: @permit_application_search.total_pages,
                       total_count: @permit_application_search.total_count,
                       current_page: @permit_application_search.current_page,
                     },
                     blueprint: PermitApplicationBlueprint,
                     blueprint_opts: {
                       view: :external_api,
                     },
                   }
  end

  def show
    authorize [:external_api, @permit_application]

    render_success @permit_application,
                   nil,
                   { blueprint: PermitApplicationBlueprint, blueprint_opts: { view: :external_api } }
  end

  private

  def set_permit_application
    @permit_application = PermitApplication.find(params[:id])
  end
end
