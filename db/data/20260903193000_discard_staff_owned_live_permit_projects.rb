# frozen_string_literal: true

class DiscardStaffOwnedLivePermitProjects < ActiveRecord::Migration[7.2]
  STAFF_ROLES = %i[
    reviewer
    review_manager
    regional_review_manager
    technical_support
  ].freeze

  def up
    now = Time.current
    project_ids =
      PermitProject
        .unscoped
        .where(sandbox_id: nil, discarded_at: nil)
        .joins(:owner)
        .where(users: { role: STAFF_ROLES })
        .pluck(:id)

    return if project_ids.empty?

    Searchkick.callbacks(false) do
      PermitProject
        .unscoped
        .where(id: project_ids)
        .update_all(discarded_at: now, updated_at: now)
      PermitApplication
        .unscoped
        .where(permit_project_id: project_ids, discarded_at: nil)
        .update_all(discarded_at: now, updated_at: now)
    end

    PermitProject.reindex
    PermitApplication.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
