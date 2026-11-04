class Api::PermitProjects::MembershipsController < Api::ApplicationController
  include Api::Concerns::Search::ProjectMemberships

  before_action :set_permit_project
  before_action :set_membership, only: %i[update destroy]

  # The payload includes the owner, who is not a membership row.
  skip_after_action :verify_policy_scoped, only: :index

  def index
    # MEMBERSHIP COMMENT - currently this shows all project memebers to everyone - confirm this later
    authorize @permit_project, :show?
    perform_project_membership_search

    render_success project_people_rows, nil, { meta: project_people_meta }
  end

  def update
    authorize @membership

    saved =
      ProjectMembership.transaction do
        assign_membership_changes
        if @membership.errors.any? || !@membership.save
          raise ActiveRecord::Rollback
        end

        true
      end

    unless saved
      return(
        render_error(
          "project_membership.update_error",
          {
            status: :unprocessable_entity,
            log_args: {
              errors: @membership.errors.full_messages,
              params: membership_params.to_h
            }
          }
        )
      )
    end

    render_success membership_row(@membership.reload)
  end

  def destroy
    authorize @membership

    if @membership.user_id == @permit_project.owner_id
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

  def membership_params
    params.require(:membership).permit(
      :contact_designation,
      :access,
      role_tags: []
    )
  end

  def assign_membership_changes
    if membership_params.key?(:role_tags)
      @membership.role_list = membership_params[:role_tags].to_a
    end

    if membership_params.key?(:access)
      access = membership_params[:access].to_s
      if ProjectMembership.accesses.key?(access)
        @membership.access = access
      else
        @membership.errors.add(:access, :inclusion)
      end
    end

    return unless membership_params.key?(:contact_designation)

    designation = membership_params[:contact_designation].to_s
    unless ProjectMembership.contact_designations.key?(designation)
      @membership.errors.add(:contact_designation, :inclusion)
      return
    end

    if @membership.primary? && designation != "primary"
      @membership.errors.add(:contact_designation, :primary_locked)
      return
    end

    @membership.release_other_primary_contact if designation == "primary"
    @membership.contact_designation = designation
  end
end
