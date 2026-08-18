# frozen_string_literal: true

# Submitter-side authorization now derives from ProjectMembership + ProjectTeam,
# so everyone who reached a project through the old submission collaborations
# needs a membership or they lose access.
#
#   delegatee -> lead        (today they can edit every block and submit)
#   assignee  -> contributor (block-scoped edit still comes from the collaboration
#                             itself; ProjectPermissions' legacy bridge grants read)
#
# Collaborator / PermitCollaboration rows are left untouched.
class BackfillProjectMembershipsFromCollaborations < ActiveRecord::Migration[
  7.2
]
  def up
    Searchkick.callbacks(false) do
      roles_by_project_and_user = {}

      # Delegatee wins: a user who is a delegatee anywhere in the project is a lead.
      project_and_user_pairs(PermitCollaboration.assignee).each do |key|
        roles_by_project_and_user[key] = :contributor
      end
      project_and_user_pairs(PermitCollaboration.delegatee).each do |key|
        roles_by_project_and_user[key] = :lead
      end

      owner_ids_by_project =
        PermitProject
          .where(id: roles_by_project_and_user.keys.map(&:first).uniq)
          .pluck(:id, :owner_id)
          .to_h

      roles_by_project_and_user.each do |(permit_project_id, user_id), role|
        next if owner_ids_by_project[permit_project_id] == user_id

        membership =
          ProjectMembership.find_or_initialize_by(
            permit_project_id: permit_project_id,
            user_id: user_id
          )
        membership.discarded_at = nil
        membership.role = role
        membership.invited_email = membership.user.email
        membership.accepted_at ||= Time.current
        membership.save!
      end
    end

    # readable_user_ids is derived from memberships, so the index has to catch up.
    PermitProject.reindex
  end

  def down
    # Backfilled memberships are indistinguishable from ones created through the
    # new UI once this has run.
    raise ActiveRecord::IrreversibleMigration
  end

  private

  def project_and_user_pairs(collaboration_scope)
    collaboration_scope
      .kept
      .submission
      .joins(:collaborator, :permit_application)
      .where.not(permit_applications: { permit_project_id: nil })
      .pluck("permit_applications.permit_project_id", "collaborators.user_id")
      .uniq
  end
end
