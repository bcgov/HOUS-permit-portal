class Api::ProjectMembershipInvitationsController < Api::ApplicationController
  skip_before_action :authenticate_user!, only: %i[show]
  skip_before_action :require_confirmation, only: %i[show]
  skip_after_action :verify_authorized, only: %i[show]
  skip_after_action :verify_policy_scoped, only: %i[show]

  def show
    membership = ProjectMembership.find_by_invitation_token(params[:token])
    unless membership
      return render_error("misc.not_found_error", { status: :not_found })
    end

    render_success membership,
                   nil,
                   {
                     blueprint: ProjectMembershipBlueprint,
                     blueprint_opts: {
                       view: :invitation
                     }
                   }
  end

  def accept
    membership = ProjectMembership.find_by_invitation_token(params[:token])
    unless membership
      return render_error("misc.not_found_error", { status: :not_found })
    end

    authorize membership, :accept?
    membership.accept!(current_user)

    render_success membership,
                   "project_membership.accept_success",
                   {
                     blueprint: ProjectMembershipBlueprint,
                     blueprint_opts: {
                       view: :base
                     }
                   }
  rescue ProjectMembership::InviteService::Error => e
    render_error "project_membership.accept_error",
                 {
                   status: :unprocessable_entity,
                   message_opts: {
                     error_message: e.message
                   }
                 }
  end
end
