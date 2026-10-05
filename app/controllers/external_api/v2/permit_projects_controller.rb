class ExternalApi::V2::PermitProjectsController < ExternalApi::ApplicationController
  before_action :set_permit_project, only: :show

  def show
    authorize [:external_api, @permit_project]

    render_success @permit_project,
                   nil,
                   {
                     blueprint: PermitProjectBlueprint,
                     blueprint_opts: {
                       view: :external_api
                     }
                   }
  end

  private

  def expected_api_version
    "v2"
  end

  def set_permit_project
    @permit_project =
      PermitProject.for_sandbox(current_sandbox).find(params[:id])
  end
end
