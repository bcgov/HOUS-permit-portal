class Api::PermitProjects::MembershipsController < Api::ApplicationController
  include Api::Concerns::Search::ProjectMemberships

  before_action :set_permit_project
  before_action :set_membership, only: %i[update destroy reinvite]

  # The payload includes the owner, who is not a membership row.
  skip_after_action :verify_policy_scoped, only: :index

  def index
    # MEMBERSHIP COMMENT - currently this shows all project memebers to everyone - confirm this later
    authorize @permit_project, :show?
    perform_project_membership_search

    render_success @project_membership_search.results,
                   nil,
                   { meta: project_people_meta }
  end

  def create
    @membership =
      @permit_project.project_memberships.new(
        invited_first_name: create_membership_params[:first_name],
        invited_last_name: create_membership_params[:last_name],
        invited_email: create_membership_params[:email],
        contact_designation:
          create_membership_params[:contact_designation].presence || :none,
        access: create_membership_params[:access].presence || :standard,
        role_tags: create_membership_params[:role_tags] || []
      )
    raw_token = issue_invitation!(@membership)
    authorize @membership

    unless @membership.save
      return(
        render_error(
          "project_membership.create_error",
          {
            status: :unprocessable_content,
            message_opts: {
              error_message: @membership.errors.full_messages.join(", ")
            },
            log_args: {
              errors: @membership.errors.full_messages
            }
          }
        )
      )
    end

    deliver_invitation(@membership, raw_token)
    refresh_membership_index(@membership)

    render_success @membership.reload, nil, { status: :created }
  end

  def reinvite
    authorize @membership

    if @membership.active?
      return(
        render_error(
          "project_membership.reinvite_active_error",
          { status: :unprocessable_content }
        )
      )
    end

    @membership.invited_email =
      reinvite_membership_params[:email] if reinvite_membership_params[
      :email
    ].present?
    raw_token = issue_invitation!(@membership)

    unless @membership.save
      return(
        render_error(
          "project_membership.reinvite_error",
          {
            status: :unprocessable_content,
            message_opts: {
              error_message: @membership.errors.full_messages.join(", ")
            },
            log_args: {
              errors: @membership.errors.full_messages
            }
          }
        )
      )
    end

    deliver_invitation(@membership, raw_token)

    render_success @membership.reload
  end

  def update
    authorize @membership

    unless @membership.update(membership_params)
      return(
        render_error(
          "project_membership.update_error",
          {
            status: :unprocessable_content,
            log_args: {
              errors: @membership.errors.full_messages,
              params: membership_params.to_h
            }
          }
        )
      )
    end

    render_success @membership.reload
  end

  def destroy
    authorize @membership

    # MEMBERSHIP COMMENT - currently blocks removing owner_id; revisit when
    # full-access members can manage people and primary contact rules are finalized.
    if @membership.user_id.present? &&
         @membership.user_id == @permit_project.owner_id
      return(
        render_error(
          "project_membership.destroy_creator_error",
          { status: :forbidden }
        )
      )
    end

    @membership.destroy!
    render_success nil
  end

  private

  def set_permit_project
    # MEMBERSHIP COMMENT - currently depends on owner
    scope = PermitProject.includes(:owner)
    scope = scope.for_sandbox(current_sandbox) unless current_user.super_admin?
    @permit_project = scope.find(params[:permit_project_id])
  end

  def set_membership
    @membership =
      @permit_project.project_memberships.includes(:user).find(params[:id])
  end

  def create_membership_params
    params.require(:membership).permit(
      :first_name,
      :last_name,
      :email,
      :contact_designation,
      :access,
      role_tags: []
    )
  end

  def reinvite_membership_params
    params.fetch(:membership, {}).permit(:email)
  end

  def issue_invitation!(membership)
    raw, digest =
      Devise.token_generator.generate(ProjectMembership, :invitation_token)
    membership.invitation_token = digest
    membership.invitation_sent_at = Time.current
    membership.invited_by = current_user
    raw
  end

  def deliver_invitation(membership, raw_token)
    PermitHubMailer.notify_project_membership_invitation(
      membership,
      raw_token
    ).deliver_later
    NotificationService.publish_project_membership_invitation_event(membership)
  end

  # The people table reads Searchkick. The default callback indexes in the
  # background, so the search that runs when the form returns misses the row.
  def refresh_membership_index(membership)
    return unless Searchkick.callbacks?

    membership.reindex(refresh: true)
  end

  def membership_params
    params.require(:membership).permit(
      :contact_designation,
      :access,
      role_tags: []
    )
  end
end
