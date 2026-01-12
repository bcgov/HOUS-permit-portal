class Api::PermitProjectsController < Api::ApplicationController
  include Api::Concerns::Search::PermitProjects
  include Api::Concerns::Search::ProjectPermitApplications

  before_action :set_permit_project,
                only: %i[
                  show
                  update
                  pin
                  unpin
                  search_permit_applications
                  submission_collaborator_options
                  create_permit_applications
                ]
  before_action :set_pinned_projects, only: %i[pinned]

  # TODO: If you create a search concern similar to Api::Concerns::Search::PermitApplications,
  # include it here for more advanced search parameter handling.
  # e.g., include Api::Concerns::Search::PermitProjects

  skip_after_action :verify_policy_scoped,
                    only: %i[index pinned jurisdiction_options]
  skip_after_action :verify_authorized, only: %i[pinned]

  def index
    perform_permit_project_search
    authorized_results = apply_search_authorization(@permit_projects)
    compute_project_ids_with_outdated_drafts(authorized_results)

    render_success authorized_results,
                   nil,
                   {
                     blueprint: PermitProjectBlueprint,
                     blueprint_opts: blueprint_options(view: :base),
                     meta: @meta
                   }
  end

  def show
    authorize @permit_project
    render_success @permit_project,
                   nil,
                   {
                     blueprint: PermitProjectBlueprint,
                     blueprint_opts: blueprint_options(view: :extended)
                   }
  end

  def update
    authorize @permit_project
    if @permit_project.update(permit_project_params)
      render_success @permit_project,
                     "permit_project.update_success",
                     {
                       blueprint: PermitProjectBlueprint,
                       blueprint_opts: blueprint_options(view: :extended)
                     }
    else
      render_error(
        "permit_project.update_error",
        {
          message_opts: {
            errors: @permit_project.errors.full_messages
          },
          status: :unprocessable_entity
        }
      )
    end
  end

  def create
    @permit_project = PermitProject.new(permit_project_params)
    @permit_project.owner = current_user # Assign the current user as the owner
    authorize @permit_project # Assuming you have a PermitProjectPolicy with :create?

    if @permit_project.save
      render_success @permit_project,
                     "permit_project.create_success", # Add this translation key
                     {
                       blueprint: PermitProjectBlueprint,
                       status: :created,
                       blueprint_opts: blueprint_options(view: :extended)
                     }
    else
      render_error(
        "permit_project.create_error", # Add this translation key
        {
          message_opts: {
            errors: @permit_project.errors.full_messages
          },
          status: :unprocessable_entity
        }
      )
    end
  end

  def pinned
    render_success @pinned_projects,
                   nil,
                   {
                     blueprint: PermitProjectBlueprint,
                     blueprint_opts: blueprint_options(view: :base)
                   }
  end

  def pin
    authorize @permit_project, :pin?
    current_user.pinned_projects.create(permit_project: @permit_project)
    set_pinned_projects
    render_success @pinned_projects,
                   "permit_project.pin_success",
                   {
                     blueprint: PermitProjectBlueprint,
                     blueprint_opts: blueprint_options(view: :base)
                   }
  end

  def unpin
    authorize @permit_project, :unpin?
    pinned_project =
      current_user.pinned_projects.find_by(permit_project: @permit_project)
    if pinned_project
      pinned_project.destroy
      set_pinned_projects
      render_success @pinned_projects,
                     "permit_project.unpin_success",
                     {
                       blueprint: PermitProjectBlueprint,
                       blueprint_opts: blueprint_options(view: :base)
                     }
    else
      render_error("permit_project.unpin_error", { status: :not_found })
    end
  end

  def search_permit_applications
    authorize @permit_project
    perform_permit_application_search
    # Results are already authorized by the policy_scope in the search concern
    authorized_results = @permit_application_search.results
    render_success authorized_results,
                   nil,
                   {
                     meta: page_meta(@permit_application_search),
                     blueprint: PermitApplicationBlueprint,
                     blueprint_opts: {
                       view: :project_base,
                       current_user: current_user
                     }
                   }
  end

  def submission_collaborator_options
    authorize @permit_project
    render_success @permit_project.submission_collaborators(current_user),
                   nil,
                   {
                     blueprint: CollaboratorOptionBlueprint,
                     blueprint_opts: {
                       view: :base
                     }
                   }
  end

  # Bulk create permit applications for a project
  # Expected params:
  #   permit_applications: [{ activity_id, permit_type_id, first_nations, jurisdiction_id?, sandbox_id? }]
  def create_permit_applications
    authorize @permit_project

    created = []
    errors = []

    permit_applications_params.each do |pa_params|
      permit_application =
        PermitApplication.new(
          submitter: current_user,
          sandbox: current_sandbox,
          permit_project: @permit_project,
          activity_id: pa_params[:activity_id],
          permit_type_id: pa_params[:permit_type_id],
          first_nations: pa_params[:first_nations],
          jurisdiction_id: pa_params[:jurisdiction_id]
        )

      authorize permit_application, :create?

      if permit_application.save
        if !Rails.env.development? || ENV["RUN_COMPLIANCE_ON_SAVE"] == "true"
          AutomatedCompliance::AutopopulateJob.perform_async(
            permit_application.id
          )
        end
        created << permit_application
      else
        errors << permit_application.errors.full_messages
      end
    end

    if errors.empty?
      render_success created,
                     "permit_application.bulk_create_success",
                     {
                       blueprint: PermitApplicationBlueprint,
                       blueprint_opts: {
                         view: :project_base
                       }
                     }
    else
      loggable_params = {
        project_id: @permit_project.id,
        current_sandbox_id: current_sandbox&.id,
        permit_applications:
          permit_applications_params.map do |pa_params|
            pa_params.slice(
              :activity_id,
              :permit_type_id,
              :first_nations,
              :jurisdiction_id,
              :permit_project_id,
              :sandbox_id
            ).to_h
          end
      }
      render_error(
        "permit_application.bulk_create_error",
        {
          message_opts: {
            error_message: errors.flatten.join(", ")
          },
          log_args: {
            errors: errors.flatten,
            params: loggable_params
          }
        },
        nil
      )
    end
  end

  def jurisdiction_options
    authorize PermitProject
    # Use policy_scope as the single source of truth for accessible projects
    jurisdicion_ids = policy_scope(PermitProject).select(:jurisdiction_id)
    jurisdictions = Jurisdiction.where(id: jurisdicion_ids).distinct
    options = jurisdictions.map { |j| { label: j.qualified_name, value: j.id } }
    render_success options, nil, { blueprint: OptionBlueprint }
  end

  private

  def set_pinned_projects
    @pinned_projects =
      apply_search_authorization(
        current_user.pinned_permit_projects.includes(:jurisdiction).reload
      )
  end

  def compute_project_ids_with_outdated_drafts(projects)
    project_ids = projects.map(&:id)
    outdated_draft_permit_applications =
      PermitApplication
        .where(
          permit_project_id: project_ids,
          status: PermitApplication.draft_statuses
        )
        .where.not(template_version_id: TemplateVersion.cached_published_ids)

    @project_ids_with_outdated_drafts =
      outdated_draft_permit_applications.pluck(:permit_project_id).to_set
  end

  def blueprint_options(view: :default)
    {
      view: view,
      current_user: current_user,
      pinned_project_ids: current_user.pinned_permit_project_ids,
      project_ids_with_outdated_drafts: @project_ids_with_outdated_drafts
    }
  end

  def set_permit_project
    @permit_project = PermitProject.includes(:jurisdiction).find(params[:id])
    compute_project_ids_with_outdated_drafts([@permit_project])
  end

  def permit_applications_params
    params
      .require(:permit_applications)
      .map do |pa_params|
        pa_params.permit(
          :activity_id,
          :permit_type_id,
          :jurisdiction_id,
          :full_address,
          :nickname,
          :pin,
          :pid,
          :first_nations,
          :permit_project_id,
          :sandbox_id,
          submission_data: {
          }
        )
      end
  end

  def permit_project_params
    params.require(:permit_project).permit(
      :title,
      :full_address,
      :pid,
      :pin,
      :jurisdiction_id,
      project_documents_attributes: [
        :id,
        :permit_project_id,
        :_destroy,
        file: [:id, :storage, metadata: %i[size filename mime_type]]
      ]
    )
  end

  # Private method perform_permit_project_search is now removed as it's in the concern.

  # Define other actions like show, create, update, destroy as needed
end
