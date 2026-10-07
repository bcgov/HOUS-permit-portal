class ExternalApi::V2::PermitProjectsController < ExternalApi::ApplicationController
  include ExternalApi::Concerns::Search::PermitProjects

  REQUIREMENT_TEMPLATE_ID_FORMAT =
    /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i

  before_action :set_permit_project,
                only: %i[show update_state create_permit_applications]

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
      @permit_project.public_send(:"#{event}!")
    end

    render_permit_project
  rescue AASM::InvalidTransition
    render_state_error(
      "Cannot transition state from '#{@permit_project.state}' to '#{target_state}'. Available states: #{available_states.join(", ")}."
    )
  end

  def create_permit_applications
    authorize [:external_api, @permit_project], :create_permit_applications?

    items = permit_application_create_params
    return render_draft_error("permit_applications is empty") if items.empty?

    template_ids =
      items.map { |item| item[:requirement_template_id].to_s.strip }
    versions_by_template_id = published_versions_by_template_id(template_ids)
    bad_ids = template_ids.reject { |id| versions_by_template_id.key?(id) }.uniq
    if bad_ids.any?
      return(
        render_draft_error(
          "Unknown, unpublished, or discarded requirement_template_id: #{bad_ids.join(", ")}"
        )
      )
    end

    created =
      PermitApplication.transaction do
        template_ids.map do |template_id|
          permit_application =
            PermitApplication.new(
              permit_project: @permit_project,
              template_version: versions_by_template_id[template_id],
              jurisdiction_id: @permit_project.jurisdiction_id,
              submitter: @permit_project.owner,
              created_by: @permit_project.jurisdiction
            )
          permit_application.save!
          permit_application
        end
      end

    created.each do |permit_application|
      enqueue_autopopulate(permit_application)
    end

    render_success created,
                   nil,
                   {
                     blueprint: PermitApplicationBlueprint,
                     blueprint_opts: {
                       view: :external_api_created_draft
                     }
                   }
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

  def permit_application_create_params
    raw = params[:permit_applications]
    return [] unless raw.is_a?(Array)

    raw.filter_map do |item|
      next unless item.respond_to?(:permit)

      item.permit(:requirement_template_id)
    end
  end

  def published_versions_by_template_id(ids)
    query_ids = ids.grep(REQUIREMENT_TEMPLATE_ID_FORMAT)
    TemplateVersion
      .published_on_kept_templates
      .for_sandbox(@permit_project.sandbox)
      .where(requirement_template_id: query_ids)
      .index_by { |version| version.requirement_template_id.to_s }
  end

  def enqueue_autopopulate(permit_application)
    unless !Rails.env.development? || ENV["RUN_COMPLIANCE_ON_SAVE"] == "true"
      return
    end

    AutomatedCompliance::AutopopulateJob.perform_async(permit_application.id)
  end

  def render_draft_error(message)
    render_error nil,
                 {
                   status: :unprocessable_entity,
                   meta: {
                     message: message,
                     type: "error"
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
