class ExternalApi::V2::PermitProjectsController < ExternalApi::ApplicationController
  include ExternalApi::Concerns::Search::PermitProjects

  before_action :set_permit_project, only: %i[show update_state]

  def index
    perform_permit_project_search

    render_success @permit_project_search.results,
                   nil,
                   {
                     meta: page_meta(@permit_project_search),
                     blueprint: PermitProjectBlueprint,
                     blueprint_opts: {
                       view: :external_api
                     }
                   }
  end

  def show
    authorize [:external_api, @permit_project]

    render_permit_project
  end

  def update_state
    authorize [:external_api, @permit_project], :update_state?

    target_state = params.require(:state).to_s

    @permit_project.with_lock do
      return render_permit_project if @permit_project.state == target_state

      event = PermitProjectState::STATE_EVENT_MAP[target_state]
      unless event && available_states.include?(target_state)
        return(
          render_state_error(
            "Cannot transition state from '#{@permit_project.state}' to '#{target_state}'. Available states: #{available_states.join(", ")}."
          )
        )
      end

      @permit_project.inbox_sort_order = nil
      Audited
        .audit_class
        .as_user(Constants::ExternalApi::PARTNER_SYSTEM_ACTOR) do
          @permit_project.public_send(:"#{event}!")
        end
    end

    render_permit_project
  rescue AASM::InvalidTransition
    render_state_error(
      "Cannot transition state from '#{@permit_project.state}' to '#{target_state}'. Available states: #{available_states.join(", ")}."
    )
  end

  private

  def expected_api_version
    "v2"
  end

  def render_permit_project
    render_success @permit_project,
                   nil,
                   {
                     blueprint: PermitProjectBlueprint,
                     blueprint_opts: {
                       view: :external_api
                     }
                   }
  end

  def render_state_error(message)
    render_error nil,
                 {
                   status: :unprocessable_entity,
                   meta: {
                     message: message,
                     type: "error"
                   }
                 }
  end

  def available_states
    @permit_project.allowed_manual_transitions.map(&:to_s)
  end

  def set_permit_project
    @permit_project =
      PermitProject.for_sandbox(current_sandbox).find(params[:id])
  end
end
