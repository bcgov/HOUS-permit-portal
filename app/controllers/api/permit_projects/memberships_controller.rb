class Api::PermitProjects::MembershipsController < Api::ApplicationController
  include Api::Concerns::Search::ProjectMemberships

  before_action :set_permit_project
  before_action :set_membership,
                only: %i[update destroy reinvite share_contact_details]

  # Authorized by the project; rows are filtered in membership_where.
  skip_after_action :verify_policy_scoped, only: :index

  def index
    authorize @permit_project, :show?
    perform_project_membership_search

    render_success @project_membership_search.results,
                   nil,
                   {
                     blueprint: ProjectMembershipBlueprint,
                     blueprint_opts: membership_blueprint_opts,
                     meta: project_people_meta
                   }
  end

  def create
    @membership =
      @permit_project.project_memberships.new(
        invited_first_name: create_membership_params[:first_name],
        invited_last_name: create_membership_params[:last_name],
        invited_email: create_membership_params[:email],
        contact_designation: :none,
        access: create_membership_params[:access].presence || :limited,
        role_tags: create_membership_params[:role_tags] || []
      )
    raw_token = issue_invitation!(@membership)
    authorize @membership

    grant_error = nil
    ProjectMembership.transaction do
      raise ActiveRecord::Rollback unless @membership.save

      grant_error = create_requested_invite_grant
      raise ActiveRecord::Rollback if grant_error
    end

    if grant_error || !ProjectMembership.exists?(@membership.id)
      return(
        render_error(
          "project_membership.create_error",
          {
            status: :unprocessable_content,
            message_opts: {
              error_message:
                grant_error || @membership.errors.full_messages.join(", ")
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

    render_success @membership.reload,
                   nil,
                   {
                     blueprint: ProjectMembershipBlueprint,
                     blueprint_opts: membership_blueprint_opts,
                     status: :created
                   }
  end

  # Re-sends to the same invited_email. A different address is a new invite.
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

    render_success @membership.reload,
                   nil,
                   {
                     blueprint: ProjectMembershipBlueprint,
                     blueprint_opts: membership_blueprint_opts
                   }
  end

  def share_contact_details
    authorize @membership

    unless @membership.update(contact_detail_params)
      return(
        render_error(
          "project_membership.update_error",
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

    render_success @membership.reload,
                   nil,
                   {
                     blueprint: ProjectMembershipBlueprint,
                     blueprint_opts: membership_blueprint_opts
                   }
  end

  def update
    authorize @membership, update_query

    saved = false
    grant_error = nil
    ProjectMembership.transaction do
      saved = @membership.update(membership_params)
      raise ActiveRecord::Rollback unless saved

      grant_error = sync_invite_grant
      raise ActiveRecord::Rollback if grant_error
    end

    if grant_error || !saved
      return(
        render_error(
          "project_membership.update_error",
          {
            status: :unprocessable_content,
            message_opts: {
              error_message:
                grant_error || @membership.errors.full_messages.join(", ")
            },
            log_args: {
              errors: @membership.errors.full_messages,
              params: membership_params.to_h
            }
          }
        )
      )
    end

    render_success @membership.reload,
                   nil,
                   {
                     blueprint: ProjectMembershipBlueprint,
                     blueprint_opts: membership_blueprint_opts
                   }
  end

  def destroy
    authorize @membership

    unless @membership.destroy
      return(
        render_error(
          "project_membership.destroy_error",
          {
            status: :unprocessable_content,
            message_opts: {
              error_message: @membership.errors.full_messages.join(", ")
            }
          }
        )
      )
    end

    render_success nil
  end

  private

  def set_permit_project
    scope = PermitProject.all
    scope = scope.for_sandbox(current_sandbox) unless current_user.super_admin?
    @permit_project = scope.find(params[:permit_project_id])
  end

  def set_membership
    @membership =
      @permit_project.project_memberships.includes(:user).find(params[:id])
  end

  def membership_blueprint_opts
    { project_access: project_access }
  end

  # Role tags are a lower bar than access and contact designation.
  def update_query
    standing =
      membership_params.key?(:access) ||
        membership_params.key?(:contact_designation) || allow_invite_requested?
    standing ? :update_standing? : :update_role_tags?
  end

  # The invitation already authorized this actor to invite. The grant rides
  # along when they say yes. Changing it later is standing (Full).
  def create_requested_invite_grant
    return unless allow_invite_param
    return unless @membership.expanded?

    grant = @membership.project_grants.create(kind: :invite)
    return if grant.persisted?

    grant.errors.full_messages.join(", ")
  end

  def sync_invite_grant
    return unless allow_invite_requested?
    return unless @membership.expanded?

    if allow_invite_param
      return if @membership.project_grants.invite.exists?

      grant = @membership.project_grants.create(kind: :invite)
      return if grant.persisted?

      grant.errors.full_messages.join(", ")
    else
      @membership.project_grants.invite.destroy_all
      nil
    end
  end

  def allow_invite_requested?
    params[:membership].respond_to?(:key?) &&
      params[:membership].key?(:allow_invite)
  end

  def allow_invite_param
    ActiveModel::Type::Boolean.new.cast(params.dig(:membership, :allow_invite))
  end

  def create_membership_params
    params.require(:membership).permit(
      :first_name,
      :last_name,
      :email,
      :access,
      role_tags: []
    )
  end

  def contact_detail_params
    params.require(:membership).permit(
      :project_contact_email,
      :project_contact_phone
    )
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
