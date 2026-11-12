# The project access matrix. One method per group of rows that must change
# together. A caller with no accepted
# membership gets false everywhere. Review staff are not an access level;
# policies OR their jurisdiction check with these answers. Rules that need
# a record (last Full member, primary contact, pending invite) stay on the
# policy.
class ProjectAccess
  # Access levels that pass a check, for policy scopes. Derived from the
  # instance method so a scope cannot drift from the check.
  def self.levels(check)
    ProjectMembership.accesses.filter_map do |level, value|
      value if new_for_level(level).public_send(check)
    end
  end

  # EXISTS clause for a policy scope. Binds :uid.
  def self.member_sql(check, project_id_sql = "permit_projects.id")
    levels = levels(check)
    return "FALSE" if levels.empty?

    <<~SQL.squish
      EXISTS (
        SELECT 1 FROM project_memberships pm
        WHERE pm.permit_project_id = #{project_id_sql}
          AND pm.user_id = :uid
          AND pm.access IN (#{levels.join(", ")})
      )
    SQL
  end

  def self.new_for_level(level)
    new(nil, nil, nil, membership: ProjectMembership.new(access: level))
  end
  private_class_method :new_for_level

  attr_reader :membership

  def initialize(user, sandbox, project, membership: nil)
    @user = user
    @sandbox = sandbox
    @project = project
    @membership = membership || load_membership
  end

  def level
    membership&.access
  end

  # Project name, information, status, people, and the application list
  # (name and status only).
  def view_project?
    member?
  end

  def edit_project?
    full?
  end

  # Not in the public grid.
  def pin_project?
    member?
  end

  # No route or UI yet.
  def archive_project?
    full?
  end

  # Invite, choose access, re-send, and cancel a pending or expired invite.
  # GRANTS TODO: Expanded with an invite grant. They must not offer Full.
  # Standard stays denied. This is not a future grant.
  def invite_people?
    full?
  end

  # Change access or contact designation, and remove an active member.
  # Hard Full block, not a grant. The grants pass must leave this Full-only.
  def manage_member_standing?
    full?
  end

  # Anyone on this project. Standard stays denied, including their own.
  # This is not a future grant.
  def edit_role_tags?(_target)
    full_or_expanded?
  end

  # Pending and expired invitations. Standard stays denied. This is not a future grant.
  def view_invitations?
    full_or_expanded?
  end

  def add_application?
    full_or_expanded?
  end

  # Also downloads, Step Code view, revision reference files, and requests
  # on the application.
  # GRANTS TODO: Standard with a grant on the application.
  def view_application?
    full_or_expanded?
  end

  # Also template version, electives, supporting documents, Step Code create
  # and edit, and responding to requests.
  # GRANTS TODO: Standard with a block grant.
  def edit_application?
    full_or_expanded?
  end

  # Standard stays denied. This is not a future grant.
  # Assigning submit to someone else is assign_submit?.
  def submit_application?
    full_or_expanded?
  end

  # GRANTS TODO: Full and Expanded assign blocks once a grant record exists.
  def assign_block?
    false
  end

  # GRANTS TODO: Full and Expanded assign submit once a grant record exists.
  def assign_submit?
    false
  end

  # Full archives any draft. Any member archives a draft they created.
  def archive_draft?(application)
    return true if full?
    return false unless member? && @user

    application.created_by_type == "User" &&
      application.created_by_id == @user.id
  end

  # Standard stays denied. This is not a future grant.
  def delete_step_code?
    full_or_expanded?
  end

  # List, detail, documents, request, edit, calendar, withdraw, and notes
  # from the local government.
  # Standard stays denied. This is not a future grant.
  def manage_meetings?
    full_or_expanded?
  end

  # The notes tab and the project notes CSV.
  # Standard stays denied. This is not a future grant.
  def view_project_notes?
    full_or_expanded?
  end

  # The activity tab.
  # Standard stays denied. This is not a future grant.
  def view_activity?
    full_or_expanded?
  end

  # The project payload. Same answers the policies use.
  def to_h
    {
      level: level,
      edit_project: edit_project?,
      invite_people: invite_people?,
      manage_member_standing: manage_member_standing?,
      view_invitations: view_invitations?,
      add_application: add_application?,
      view_application: view_application?,
      edit_application: edit_application?,
      submit_application: submit_application?,
      delete_step_code: delete_step_code?,
      manage_meetings: manage_meetings?,
      view_project_notes: view_project_notes?,
      view_activity: view_activity?
    }
  end

  private

  def load_membership
    return unless @user && @project&.persisted?
    return unless @user.super_admin? || @project.sandbox_id == @sandbox&.id

    @project.project_memberships.find_by(user_id: @user.id)
  end

  def member?
    membership.present?
  end

  def full?
    membership&.full? || false
  end

  def expanded?
    membership&.expanded? || false
  end

  def full_or_expanded?
    full? || expanded?
  end
end
