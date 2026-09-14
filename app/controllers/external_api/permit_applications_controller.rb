class ExternalApi::PermitApplicationsController < ExternalApi::ApplicationController
  include ExternalApi::Concerns::Search::PermitApplications

  before_action :set_permit_application, only: %i[show update_status]
  before_action :set_template_version, only: :show_integration_mapping

  def index
    perform_permit_application_search
    render_success @permit_application_search.results,
                   nil,
                   {
                     meta: page_meta(@permit_application_search),
                     blueprint: PermitApplicationBlueprint,
                     blueprint_opts: {
                       view: permit_application_blueprint_view
                     }
                   }
  end

  def show
    authorize [:external_api, @permit_application]

    render_permit_application
  end

  def update_status
    authorize [:external_api, @permit_application], :update_status?

    target_status = params.require(:status).to_s
    unless Constants::ExternalApi::PARTNER_WRITABLE_APPLICATION_STATUSES.include?(
             target_status
           )
      return(
        render_status_error(
          "Invalid status '#{target_status}'. Allowed status codes: #{partner_writable_statuses}."
        )
      )
    end

    @permit_application.with_lock do
      if @permit_application.status == target_status
        return render_permit_application
      end

      event = PermitApplicationStatus::STATUS_EVENT_MAP[target_status]
      unless event && @permit_application.aasm.may_fire_event?(event)
        return(
          render_status_error(
            "Cannot transition status from '#{@permit_application.status}' to '#{target_status}'. Allowed partner status codes: #{partner_writable_statuses}."
          )
        )
      end

      @permit_application.inbox_sort_order = nil
      Audited
        .audit_class
        .as_user(Constants::ExternalApi::PARTNER_SYSTEM_ACTOR) do
          @permit_application.public_send(:"#{event}!")
        end
    end

    render_permit_application
  rescue AASM::InvalidTransition, ActiveRecord::RecordInvalid
    render_status_error(
      "Cannot transition status to '#{target_status}'. Allowed partner status codes: #{partner_writable_statuses}."
    )
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

  def render_permit_application
    render_success @permit_application,
                   nil,
                   {
                     blueprint: PermitApplicationBlueprint,
                     blueprint_opts: {
                       view: permit_application_blueprint_view
                     }
                   }
  end

  def permit_application_blueprint_view
    :external_api
  end

  def render_status_error(message)
    render_error nil,
                 {
                   status: :unprocessable_entity,
                   meta: {
                     message: message,
                     type: "error"
                   }
                 }
  end

  def partner_writable_statuses
    Constants::ExternalApi::PARTNER_WRITABLE_APPLICATION_STATUSES.join(", ")
  end

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
