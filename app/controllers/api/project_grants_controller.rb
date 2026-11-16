class Api::ProjectGrantsController < Api::ApplicationController
  # The application is the door. There is no grant scope to apply.
  skip_after_action :verify_policy_scoped, only: :index
  after_action :verify_authorized, only: :index

  def index
    application = PermitApplication.find(params[:permit_application_id])
    authorize application, :open_people?
    render_success application
                     .project_grants
                     .includes(project_membership: :user)
                     .order(:created_at)
  rescue ActiveRecord::RecordNotFound
    skip_authorization
    raise
  end

  def create
    @grant = build_grant
    authorize @grant

    if @grant.save
      render_success @grant, nil, status: :created
    else
      render_error "project_grant.create_error",
                   {
                     status: :unprocessable_content,
                     message_opts: {
                       error_message: @grant.errors.full_messages.join(", ")
                     }
                   }
    end
  rescue ActiveRecord::RecordNotFound
    skip_authorization
    raise
  end

  def destroy
    @grant = find_grant
    authorize @grant
    @grant.destroy!
    head :no_content
  rescue ActiveRecord::RecordNotFound
    skip_authorization
    raise
  end

  private

  def build_grant
    if params[:permit_application_id]
      ProjectGrant.build_for_application(
        PermitApplication.find(params[:permit_application_id]),
        membership_id: params.dig(:grant, :membership_id),
        kind: params.dig(:grant, :kind),
        requirement_block_id: params.dig(:grant, :requirement_block_id)
      )
    else
      ProjectGrant.build_invite_grant(
        PermitProject.find(params[:permit_project_id]),
        membership_id: params[:membership_id]
      )
    end
  end

  def find_grant
    grant = ProjectGrant.find(params[:id])
    if params[:permit_application_id].present? &&
         grant.permit_application_id != params[:permit_application_id]
      raise ActiveRecord::RecordNotFound
    end
    if params[:membership_id].present? &&
         grant.project_membership_id != params[:membership_id]
      raise ActiveRecord::RecordNotFound
    end
    grant
  end
end
