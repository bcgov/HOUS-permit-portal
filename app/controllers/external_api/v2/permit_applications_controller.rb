class ExternalApi::V2::PermitApplicationsController < ExternalApi::PermitApplicationsController
  # Rails drops a parent before_action with the same method name; re-list inherited actions.
  before_action :set_permit_application,
                only: %i[show update_status show_submission_version]

  def show_submission_version
    authorize [:external_api, @permit_application]

    submission_version =
      @permit_application.submission_versions.find(
        params[:submission_version_id]
      )

    render_success submission_version,
                   nil,
                   {
                     blueprint: SubmissionVersionBlueprint,
                     blueprint_opts: {
                       view: :external_api
                     }
                   }
  end

  private

  def expected_api_version
    "v2"
  end

  def permit_application_blueprint_view
    :external_api_v2
  end
end
