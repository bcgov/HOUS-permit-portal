class Api::PermitProjectsController < Api::ApplicationController
  include Api::Concerns::Search::PermitProjects # Include the new concern

  before_action :set_permit_project, only: %i[show update pin unpin]

  # TODO: If you create a search concern similar to Api::Concerns::Search::PermitApplications,
  # include it here for more advanced search parameter handling.
  # e.g., include Api::Concerns::Search::PermitProjects

  skip_after_action :verify_policy_scoped, only: %i[index pinned]
  skip_after_action :verify_authorized, only: %i[pinned]

  def index
    perform_permit_project_search # This method now comes from the concern

    # Apply your iterative authorization method to the Searchkick results.
    # This will use PermitProjectPolicy#index? for each instance.
    authorized_results =
      apply_search_authorization(@permit_project_search.results)

    render_success authorized_results,
                   nil,
                   {
                     meta: {
                       total_pages: @permit_project_search.total_pages,
                       total_count: @permit_project_search.total_count,
                       current_page: @permit_project_search.current_page
                     },
                     blueprint: PermitProjectBlueprint,
                     blueprint_opts: blueprint_options
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
                     nil,
                     {
                       blueprint: PermitProjectBlueprint,
                       blueprint_opts: blueprint_options(view: :extended)
                     }
    else
      render_error @permit_project.errors, :unprocessable_entity
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
    pinned_projects =
      apply_search_authorization(current_user.pinned_permit_projects)
    render_success pinned_projects,
                   nil,
                   {
                     blueprint: PermitProjectBlueprint,
                     blueprint_opts: blueprint_options
                   }
  end

  def pin
    authorize @permit_project, :pin?
    current_user.pinned_projects.create(permit_project: @permit_project)
    render_success @permit_project,
                   "permit_project.pin_success",
                   {
                     blueprint: PermitProjectBlueprint,
                     blueprint_opts: blueprint_options(view: :extended)
                   }
  end

  def unpin
    authorize @permit_project, :unpin?
    pinned_project =
      current_user.pinned_projects.find_by(permit_project: @permit_project)
    if pinned_project
      pinned_project.destroy
      render_success @permit_project,
                     "permit_project.unpin_success",
                     {
                       blueprint: PermitProjectBlueprint,
                       blueprint_opts: blueprint_options(view: :extended)
                     }
    else
      render_error "permit_project.unpin_error", :not_found
    end
  end

  private

  def blueprint_options(view: :default)
    {
      view: view,
      current_user: current_user,
      pinned_project_ids: current_user.pinned_permit_project_ids
    }
  end

  def set_permit_project
    @permit_project = PermitProject.find(params[:id])
  end

  def permit_project_params
    params.require(:permit_project).permit(
      :title, # Changed from name and description
      :full_address, # Added full_address
      :pid, # Added pid
      :pin, # Added pin
      :property_plan_jurisdiction_id, # Added property_plan_jurisdiction_id
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
